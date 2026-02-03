from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse, FileResponse
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from app.database.connection import get_session
from app.models.usuario import Usuario
from app.models.valoracion import (
    Valoracion, Trabajador, InfoLaboral,
    HistoriaOcupacional, ActividadLaboral, EstadoValoracion
)
from app.models.evaluacion import EvaluacionRiesgo
from app.models.concepto import ConceptoFinal
from app.schemas.valoracion import (
    ValoracionCreate, ValoracionUpdate,
    ValoracionResponse, ValoracionListItem
)
from app.services.auth import get_current_user
from app.services.pdf_generator_nuevo import generar_pdf_valoracion
from app.services.excel_generator_simple import generar_excel_valoracion
from pathlib import Path
import os

router = APIRouter(prefix="/valoraciones", tags=["Valoraciones"])

@router.post("/", response_model=ValoracionResponse, status_code=status.HTTP_201_CREATED)
def crear_valoracion(
    valoracion_data: ValoracionCreate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Crea una nueva valoración"""
    
    # 1. Crear valoración principal
    valoracion = Valoracion(
        fecha_valoracion=valoracion_data.fecha_valoracion,
        estado=EstadoValoracion.BORRADOR,
        creado_por=current_user.id
    )
    session.add(valoracion)
    session.commit()
    session.refresh(valoracion)
    
    # 2. Crear trabajador
    trabajador = Trabajador(
        valoracion_id=valoracion.id,
        **valoracion_data.trabajador.model_dump()
    )
    session.add(trabajador)
    
    # 3. Crear info laboral si existe
    if valoracion_data.info_laboral:
        info_laboral = InfoLaboral(
            valoracion_id=valoracion.id,
            **valoracion_data.info_laboral.model_dump()
        )
        session.add(info_laboral)
    
    # 4. Crear historia ocupacional
    for hist in valoracion_data.historia_ocupacional:
        historia = HistoriaOcupacional(
            valoracion_id=valoracion.id,
            **hist.model_dump()
        )
        session.add(historia)
    
    # 5. Crear actividad laboral si existe
    if valoracion_data.actividad_laboral:
        actividad = ActividadLaboral(
            valoracion_id=valoracion.id,
            **valoracion_data.actividad_laboral.model_dump()
        )
        session.add(actividad)
    
    # 6. Crear evaluaciones de riesgo
    for eval_data in valoracion_data.evaluaciones_riesgo:
        evaluacion = EvaluacionRiesgo(
            valoracion_id=valoracion.id,
            **eval_data.model_dump()
        )
        session.add(evaluacion)
    
    # 7. Crear concepto si existe
    if valoracion_data.concepto:
        concepto = ConceptoFinal(
            valoracion_id=valoracion.id,
            **valoracion_data.concepto.model_dump()
        )
        session.add(concepto)
    
    session.commit()
    session.refresh(valoracion)
    
    return _valoracion_to_response(valoracion, session)

@router.get("/")
def listar_valoraciones(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    buscar: Optional[str] = None,
    estado: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista las valoraciones con filtros opcionales"""

    # Query base para contar total
    count_query = select(Valoracion)

    # Si no es admin o supervisor, solo ve las suyas
    if current_user.rol == "psicologo":
        count_query = count_query.where(Valoracion.creado_por == current_user.id)

    # Filtro por estado
    if estado and estado != "todos":
        count_query = count_query.where(Valoracion.estado == estado)

    # Contar total antes de paginación
    total = len(session.exec(count_query).all())

    # Query para obtener datos paginados
    query = select(Valoracion).order_by(Valoracion.created_at.desc())

    # Si no es admin o supervisor, solo ve las suyas
    if current_user.rol == "psicologo":
        query = query.where(Valoracion.creado_por == current_user.id)

    # Filtro por estado
    if estado and estado != "todos":
        query = query.where(Valoracion.estado == estado)

    # Aplicar paginación
    query = query.offset(skip).limit(limit)

    valoraciones = session.exec(query).all()

    # Construir respuesta
    result = []
    for val in valoraciones:
        # Obtener trabajador
        trab_query = select(Trabajador).where(Trabajador.valoracion_id == val.id)
        trabajador = session.exec(trab_query).first()

        # Obtener info laboral para empresa
        info_query = select(InfoLaboral).where(InfoLaboral.valoracion_id == val.id)
        info = session.exec(info_query).first()

        # Filtro de búsqueda
        if buscar:
            buscar_lower = buscar.lower()
            nombre_match = trabajador and buscar_lower in trabajador.nombre.lower()
            doc_match = trabajador and buscar_lower in trabajador.documento.lower()
            if not (nombre_match or doc_match):
                continue

        result.append({
            "id": val.id,
            "fecha_valoracion": val.fecha_valoracion,
            "estado": val.estado,
            "created_at": val.created_at,
            "trabajador_nombre": trabajador.nombre if trabajador else None,
            "trabajador_documento": trabajador.documento if trabajador else None,
            "empresa": info.empresa if info else None
        })

    return {
        "items": result,
        "total": total
    }

@router.get("/{valoracion_id}", response_model=ValoracionResponse)
def obtener_valoracion(
    valoracion_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene una valoración por ID"""
    
    valoracion = session.get(Valoracion, valoracion_id)
    
    if not valoracion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Valoración no encontrada"
        )
    
    # Verificar permisos
    if current_user.rol == "psicologo" and valoracion.creado_por != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permiso para ver esta valoración"
        )
    
    return _valoracion_to_response(valoracion, session)

@router.post("/{valoracion_id}/finalizar")
def finalizar_valoracion(
    valoracion_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Finaliza una valoración cambiando su estado a 'completada' y generando el PDF
    """

    valoracion = session.get(Valoracion, valoracion_id)

    if not valoracion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Valoración no encontrada"
        )

    # Verificar permisos
    if current_user.rol == "psicologo" and valoracion.creado_por != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permiso para finalizar esta valoración"
        )

    # Verificar que tiene concepto
    conc_query = select(ConceptoFinal).where(ConceptoFinal.valoracion_id == valoracion_id)
    concepto = session.exec(conc_query).first()

    if not concepto or (not concepto.concepto_generado and not concepto.concepto_editado):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La valoración debe tener un concepto (generado o escrito manualmente) antes de finalizar"
        )

    # Verificar que tiene firmas
    if not concepto.elaboro_nombre or not concepto.reviso_nombre:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La valoración debe tener los nombres de quién elaboró y revisó"
        )

    # Cambiar estado a completada
    valoracion.estado = EstadoValoracion.COMPLETADA
    valoracion.updated_at = datetime.utcnow()
    session.commit()
    session.refresh(valoracion)

    # Cargar todas las relaciones para el PDF
    trab_query = select(Trabajador).where(Trabajador.valoracion_id == valoracion_id)
    valoracion.trabajador = session.exec(trab_query).first()

    info_query = select(InfoLaboral).where(InfoLaboral.valoracion_id == valoracion_id)
    valoracion.info_laboral = session.exec(info_query).first()

    hist_query = select(HistoriaOcupacional).where(
        HistoriaOcupacional.valoracion_id == valoracion_id
    ).order_by(HistoriaOcupacional.orden)
    valoracion.historia_ocupacional = list(session.exec(hist_query).all())

    act_query = select(ActividadLaboral).where(ActividadLaboral.valoracion_id == valoracion_id)
    valoracion.actividad_laboral = session.exec(act_query).first()

    eval_query = select(EvaluacionRiesgo).where(
        EvaluacionRiesgo.valoracion_id == valoracion_id
    ).order_by(EvaluacionRiesgo.categoria, EvaluacionRiesgo.item_numero)
    valoracion.evaluaciones_riesgo = list(session.exec(eval_query).all())

    valoracion.concepto = concepto

    trabajador = valoracion.trabajador
    info_laboral = valoracion.info_laboral
    historia = valoracion.historia_ocupacional
    actividad = valoracion.actividad_laboral
    evaluaciones = valoracion.evaluaciones_riesgo

    # Generar Excel y PDF
    try:
        # 1. Generar Excel simple
        excel_path = generar_excel_valoracion(
            valoracion=valoracion,
            trabajador=trabajador,
            info_laboral=info_laboral,
            historia_ocupacional=historia,
            actividad_laboral=actividad,
            evaluaciones=evaluaciones,
            concepto=concepto,
            guardar_archivo=True,
            output_dir="pdfs"
        )

        excel_filename = Path(excel_path).name
        excel_url = f"/pdfs/{excel_filename}"

        # 2. Generar PDF profesional (independiente del Excel)
        pdf_path = generar_pdf_valoracion(
            valoracion=valoracion,
            trabajador=trabajador,
            info_laboral=info_laboral,
            historia_ocupacional=historia,
            actividad_laboral=actividad,
            evaluaciones=evaluaciones,
            concepto=concepto,
            output_dir="pdfs"
        )

        pdf_filename = Path(pdf_path).name
        pdf_url = f"/pdfs/{pdf_filename}"

        return {
            "message": "Valoración finalizada exitosamente",
            "estado": valoracion.estado.value,
            "pdf_url": pdf_url,
            "pdf_filename": pdf_filename,
            "excel_url": excel_url,
            "excel_filename": excel_filename
        }
    except Exception as e:
        # Si falla la generación, revertir el estado
        valoracion.estado = EstadoValoracion.BORRADOR
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar los archivos: {str(e)}"
        )

@router.put("/{valoracion_id}", response_model=ValoracionResponse)
def actualizar_valoracion(
    valoracion_id: int,
    valoracion_data: ValoracionUpdate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualiza una valoración existente"""
    
    valoracion = session.get(Valoracion, valoracion_id)
    
    if not valoracion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Valoración no encontrada"
        )
    
    # Verificar permisos
    if current_user.rol == "psicologo" and valoracion.creado_por != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permiso para editar esta valoración"
        )
    
    # Actualizar campos básicos
    if valoracion_data.fecha_valoracion:
        valoracion.fecha_valoracion = valoracion_data.fecha_valoracion
    if valoracion_data.estado:
        valoracion.estado = valoracion_data.estado
    
    valoracion.updated_at = datetime.utcnow()
    
    # Actualizar trabajador
    if valoracion_data.trabajador:
        trab_query = select(Trabajador).where(Trabajador.valoracion_id == valoracion_id)
        trabajador = session.exec(trab_query).first()
        if trabajador:
            for key, value in valoracion_data.trabajador.model_dump().items():
                setattr(trabajador, key, value)
    
    # Actualizar info laboral
    if valoracion_data.info_laboral:
        info_query = select(InfoLaboral).where(InfoLaboral.valoracion_id == valoracion_id)
        info = session.exec(info_query).first()
        if info:
            for key, value in valoracion_data.info_laboral.model_dump().items():
                setattr(info, key, value)
        else:
            info = InfoLaboral(
                valoracion_id=valoracion_id,
                **valoracion_data.info_laboral.model_dump()
            )
            session.add(info)
    
    # Actualizar actividad laboral
    if valoracion_data.actividad_laboral:
        act_query = select(ActividadLaboral).where(ActividadLaboral.valoracion_id == valoracion_id)
        actividad = session.exec(act_query).first()
        if actividad:
            for key, value in valoracion_data.actividad_laboral.model_dump().items():
                setattr(actividad, key, value)
        else:
            actividad = ActividadLaboral(
                valoracion_id=valoracion_id,
                **valoracion_data.actividad_laboral.model_dump()
            )
            session.add(actividad)
    
    # Actualizar historia ocupacional (reemplazar todo)
    if valoracion_data.historia_ocupacional is not None:
        # Eliminar existentes
        hist_query = select(HistoriaOcupacional).where(HistoriaOcupacional.valoracion_id == valoracion_id)
        for hist in session.exec(hist_query).all():
            session.delete(hist)
        # Crear nuevos
        for hist_data in valoracion_data.historia_ocupacional:
            historia = HistoriaOcupacional(
                valoracion_id=valoracion_id,
                **hist_data.model_dump()
            )
            session.add(historia)
    
    # Actualizar evaluaciones de riesgo (reemplazar todo)
    if valoracion_data.evaluaciones_riesgo is not None:
        # Eliminar existentes
        eval_query = select(EvaluacionRiesgo).where(EvaluacionRiesgo.valoracion_id == valoracion_id)
        for ev in session.exec(eval_query).all():
            session.delete(ev)
        # Crear nuevos
        for eval_data in valoracion_data.evaluaciones_riesgo:
            evaluacion = EvaluacionRiesgo(
                valoracion_id=valoracion_id,
                **eval_data.model_dump()
            )
            session.add(evaluacion)
    
    # Actualizar concepto
    if valoracion_data.concepto:
        conc_query = select(ConceptoFinal).where(ConceptoFinal.valoracion_id == valoracion_id)
        concepto = session.exec(conc_query).first()
        if concepto:
            # Solo actualizar campos que no son None para preservar valores existentes
            for key, value in valoracion_data.concepto.model_dump().items():
                if value is not None:
                    setattr(concepto, key, value)
            concepto.updated_at = datetime.utcnow()
        else:
            concepto = ConceptoFinal(
                valoracion_id=valoracion_id,
                **valoracion_data.concepto.model_dump()
            )
            session.add(concepto)
    
    session.commit()
    session.refresh(valoracion)
    
    return _valoracion_to_response(valoracion, session)

@router.delete("/{valoracion_id}")
def eliminar_valoracion(
    valoracion_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Elimina una valoración"""

    valoracion = session.get(Valoracion, valoracion_id)

    if not valoracion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Valoración no encontrada"
        )

    # Solo admin puede eliminar
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede eliminar valoraciones"
        )

    # Eliminar en cascada
    # Trabajador
    trab_query = select(Trabajador).where(Trabajador.valoracion_id == valoracion_id)
    for t in session.exec(trab_query).all():
        session.delete(t)

    # Info laboral
    info_query = select(InfoLaboral).where(InfoLaboral.valoracion_id == valoracion_id)
    for i in session.exec(info_query).all():
        session.delete(i)

    # Historia ocupacional
    hist_query = select(HistoriaOcupacional).where(HistoriaOcupacional.valoracion_id == valoracion_id)
    for h in session.exec(hist_query).all():
        session.delete(h)

    # Actividad laboral
    act_query = select(ActividadLaboral).where(ActividadLaboral.valoracion_id == valoracion_id)
    for a in session.exec(act_query).all():
        session.delete(a)

    # Evaluaciones
    eval_query = select(EvaluacionRiesgo).where(EvaluacionRiesgo.valoracion_id == valoracion_id)
    for e in session.exec(eval_query).all():
        session.delete(e)

    # Concepto
    conc_query = select(ConceptoFinal).where(ConceptoFinal.valoracion_id == valoracion_id)
    for c in session.exec(conc_query).all():
        session.delete(c)

    # Valoración
    session.delete(valoracion)
    session.commit()

    return {"message": "Valoración eliminada correctamente"}


@router.get("/{valoracion_id}/descargar-excel")
def descargar_excel(
    valoracion_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Descarga el archivo Excel de una valoración completada"""

    valoracion = session.get(Valoracion, valoracion_id)

    if not valoracion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Valoración no encontrada"
        )

    # Verificar permisos
    if current_user.rol == "psicologo" and valoracion.creado_por != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permiso para descargar esta valoración"
        )

    # Datos para nombre de archivo
    trab_query = select(Trabajador).where(Trabajador.valoracion_id == valoracion_id)
    trabajador = session.exec(trab_query).first()
    
    nombre = trabajador.nombre if trabajador else "sin_nombre"
    documento = trabajador.documento if trabajador else "sin_doc"
    
    # Intentar buscar el archivo existente primero (el más reciente)
    pdfs_dir = Path("pdfs")
    if pdfs_dir.exists():
        # Patrón de búsqueda aproximado
        clean_nombre = nombre.replace(' ', '_').replace('/', '')[:20] # truncate para evitar problemas
        clean_doc = documento.replace(' ', '_')[:15]
        
        # Buscar archivos que coincidan con el patrón y sean .xlsx
        # Nota: El generador usa sanitize_filename que es más estricto. 
        # Intentaremos buscar por ID o fecha si es posible, pero aquí buscamos el más reciente que parezca ser de esta valoración
        # Una estrategia mejor es rehacer la generación si no se encuentra exacto, pero el usuario pidió "guardar los archivos que realmente se estan generando"
        
        # Para simplificar y ser seguros: Si la valoración está completada, regeneramos y guardamos (o sobreescribimos).
        # Esto asegura que "realmente se guarda". 
        # Pero el usuario se queja de "Error". 
        # Vamos a intentar generar y servir el archivo FÍSICO.
        pass

    # Cargar relaciones necesarias
    info_query = select(InfoLaboral).where(InfoLaboral.valoracion_id == valoracion_id)
    info_laboral = session.exec(info_query).first()

    hist_query = select(HistoriaOcupacional).where(
        HistoriaOcupacional.valoracion_id == valoracion_id
    ).order_by(HistoriaOcupacional.orden)
    historia = list(session.exec(hist_query).all())

    act_query = select(ActividadLaboral).where(ActividadLaboral.valoracion_id == valoracion_id)
    actividad = session.exec(act_query).first()

    eval_query = select(EvaluacionRiesgo).where(
        EvaluacionRiesgo.valoracion_id == valoracion_id
    ).order_by(EvaluacionRiesgo.categoria, EvaluacionRiesgo.item_numero)
    evaluaciones = list(session.exec(eval_query).all())

    conc_query = select(ConceptoFinal).where(ConceptoFinal.valoracion_id == valoracion_id)
    concepto = session.exec(conc_query).first()

    try:
        # Generar Excel FÍSICO en el servidor para persistencia
        excel_path = generar_excel_valoracion(
            valoracion=valoracion,
            trabajador=trabajador,
            info_laboral=info_laboral,
            historia_ocupacional=historia,
            actividad_laboral=actividad,
            evaluaciones=evaluaciones,
            concepto=concepto,
            guardar_archivo=True,  # Guardar archivo real
            output_dir="pdfs"
        )
        
        filename = os.path.basename(excel_path)

        # Retornar el archivo guardado
        return FileResponse(
            path=excel_path,
            filename=filename,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except Exception as e:
        print(f"Error generando excel: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar el Excel: {str(e)}"
        )


@router.get("/{valoracion_id}/descargar-pdf")
def descargar_pdf(
    valoracion_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Descarga el archivo PDF de una valoración completada"""

    valoracion = session.get(Valoracion, valoracion_id)

    if not valoracion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Valoración no encontrada"
        )

    # Verificar permisos
    if current_user.rol == "psicologo" and valoracion.creado_por != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permiso para descargar esta valoración"
        )

    # Cargar todas las relaciones
    trab_query = select(Trabajador).where(Trabajador.valoracion_id == valoracion_id)
    trabajador = session.exec(trab_query).first()

    info_query = select(InfoLaboral).where(InfoLaboral.valoracion_id == valoracion_id)
    info_laboral = session.exec(info_query).first()

    hist_query = select(HistoriaOcupacional).where(
        HistoriaOcupacional.valoracion_id == valoracion_id
    ).order_by(HistoriaOcupacional.orden)
    historia = list(session.exec(hist_query).all())

    act_query = select(ActividadLaboral).where(ActividadLaboral.valoracion_id == valoracion_id)
    actividad = session.exec(act_query).first()

    eval_query = select(EvaluacionRiesgo).where(
        EvaluacionRiesgo.valoracion_id == valoracion_id
    ).order_by(EvaluacionRiesgo.categoria, EvaluacionRiesgo.item_numero)
    evaluaciones = list(session.exec(eval_query).all())

    conc_query = select(ConceptoFinal).where(ConceptoFinal.valoracion_id == valoracion_id)
    concepto = session.exec(conc_query).first()

    try:
        # Generar PDF físicamente y guardarlo
        pdf_path = generar_pdf_valoracion(
            valoracion=valoracion,
            trabajador=trabajador,
            info_laboral=info_laboral,
            historia_ocupacional=historia,
            actividad_laboral=actividad,
            evaluaciones=evaluaciones,
            concepto=concepto,
            output_dir="pdfs"
        )
        
        filename = os.path.basename(pdf_path)

        # Retornar el archivo físico
        return FileResponse(
            path=pdf_path,
            filename=filename,
            media_type="application/pdf"
        )
    except Exception as e:
        print(f"Error generando PDF: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar el PDF: {str(e)}"
        )



def _valoracion_to_response(valoracion: Valoracion, session: Session) -> ValoracionResponse:
    """Convierte una valoración a su schema de respuesta"""
    from app.schemas.valoracion import (
        TrabajadorSchema, InfoLaboralSchema, HistoriaOcupacionalSchema,
        ActividadLaboralSchema, EvaluacionRiesgoSchema, ConceptoFinalSchema
    )
    
    # Obtener trabajador
    trab_query = select(Trabajador).where(Trabajador.valoracion_id == valoracion.id)
    trabajador = session.exec(trab_query).first()
    
    # Obtener info laboral
    info_query = select(InfoLaboral).where(InfoLaboral.valoracion_id == valoracion.id)
    info_laboral = session.exec(info_query).first()
    
    # Obtener historia ocupacional
    hist_query = select(HistoriaOcupacional).where(
        HistoriaOcupacional.valoracion_id == valoracion.id
    ).order_by(HistoriaOcupacional.orden)
    historia = session.exec(hist_query).all()
    
    # Obtener actividad laboral
    act_query = select(ActividadLaboral).where(ActividadLaboral.valoracion_id == valoracion.id)
    actividad = session.exec(act_query).first()
    
    # Obtener evaluaciones
    eval_query = select(EvaluacionRiesgo).where(
        EvaluacionRiesgo.valoracion_id == valoracion.id
    ).order_by(EvaluacionRiesgo.categoria, EvaluacionRiesgo.item_numero)
    evaluaciones = session.exec(eval_query).all()
    
    # Obtener concepto
    conc_query = select(ConceptoFinal).where(ConceptoFinal.valoracion_id == valoracion.id)
    concepto = session.exec(conc_query).first()
    
    return ValoracionResponse(
        id=valoracion.id,
        fecha_valoracion=valoracion.fecha_valoracion,
        estado=valoracion.estado,
        created_at=valoracion.created_at,
        updated_at=valoracion.updated_at,
        creado_por=valoracion.creado_por,
        trabajador=TrabajadorSchema.model_validate(trabajador, from_attributes=True) if trabajador else None,
        info_laboral=InfoLaboralSchema.model_validate(info_laboral, from_attributes=True) if info_laboral else None,
        historia_ocupacional=[HistoriaOcupacionalSchema.model_validate(h, from_attributes=True) for h in historia],
        actividad_laboral=ActividadLaboralSchema.model_validate(actividad, from_attributes=True) if actividad else None,
        evaluaciones_riesgo=[EvaluacionRiesgoSchema.model_validate(e, from_attributes=True) for e in evaluaciones],
        concepto=ConceptoFinalSchema.model_validate(concepto, from_attributes=True) if concepto else None
    )