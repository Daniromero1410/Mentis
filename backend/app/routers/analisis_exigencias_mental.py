"""
Router para el módulo de AEs de Trabajo
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlmodel import Session, select
from typing import List, Dict, Optional
from pydantic import BaseModel
from datetime import datetime
from pathlib import Path
import os

from app.database.connection import get_session
from app.models.usuario import Usuario
from app.models.analisis_exigencia_mental import (
    AnalisisExigenciaMental, TrabajadorAE, DatosEmpresaAE,
    DatosEvaluadorAE, SeccionesAE, CondicionRiesgoAE,
    ResumenFactorAE, ConceptoFinalAE, EstadoAE
)
from app.schemas.analisis_exigencia_mental import (
    AnalisisExigenciaMentalCreate, AnalisisExigenciaMentalResponse, AnalisisExigenciaMentalListItem,
    AnalisisExigenciaMentalUpdate, PaginatedAEsResponse,
    DatosEmpresaAECreate, TrabajadorAECreate, DatosEvaluadorCreate,
    SeccionesAECreate, CondicionRiesgoAECreate, ResumenFactorAECreate,
    ConceptoFinalAECreate, FinalizarAEResponse
)
from app.services.auth import get_current_user
from app.services.pdf_generator_analisis_exigencia_mental import generar_pdf_analisis_exigencia_mental

router = APIRouter(prefix="/analisis-exigencias-mental", tags=["AEs de Trabajo"])



# ===== GENERACIÓN DE CONCEPTOS CON IA (NUEVO) =====

class GenerarConceptoAERequest(BaseModel):
    AE_id: Optional[int] = None
    # Datos opcionales para generación sin guardar
    nombre_trabajador: Optional[str] = None
    condiciones_riesgo: Optional[List[CondicionRiesgoAECreate]] = None

class ConceptoAEResponse(BaseModel):
    analisis: str
    recomendaciones: str
    concepto_completo: str
    resumen_riesgos: Dict

from app.services.ml_analisis_exigencia_mental_generator import generar_concepto_analisis_exigencia_mental
from app.models.evaluacion import EvaluacionRiesgo, CategoriaRiesgo, CalificacionRiesgo

@router.post("/generar-concepto-ia", response_model=ConceptoAEResponse)
def generar_concepto_AE(
    request: GenerarConceptoAERequest,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Genera análisis y recomendaciones automáticas para una AE de Trabajo.
    Puede funcionar con un ID de AE existente O con datos enviados directamente.
    """
    
    nombre_trabajador = "el trabajador"
    condiciones_input = []
    
    # ESTRATEGIA 1: Usar AE existente
    if request.AE_id:
        AE = session.get(AnalisisExigenciaMental, request.AE_id)
        if not AE:
            raise HTTPException(status_code=404, detail="AE no encontrada")

        if current_user.rol == "psicologo" and AE.creado_por != current_user.id:
            raise HTTPException(status_code=403, detail="Sin permiso")
            
        # Obtener datos de DB
        trabajador = session.exec(select(TrabajadorAE).where(TrabajadorAE.AE_id == request.AE_id)).first()
        nombre_trabajador = trabajador.nombre if trabajador else "el trabajador"
        
        condiciones_db = session.exec(select(CondicionRiesgoAE).where(CondicionRiesgoAE.AE_id == request.AE_id)).all()
        
        # Convertir a formato común (usamos la estructura de CondicionRiesgoAECreate/DB como base)
        condiciones_input = condiciones_db
        
    # ESTRATEGIA 2: Usar datos enviados (Direct Generation without Save)
    elif request.condiciones_riesgo:
        nombre_trabajador = request.nombre_trabajador or "el trabajador"
        condiciones_input = request.condiciones_riesgo
        
    else:
        raise HTTPException(status_code=400, detail="Debe proporcionar AE_id o condiciones_riesgo")

    if not condiciones_input:
        # Retornar vacío amigable en lugar de error si no hay riesgos marcados
        return ConceptoAEResponse(
            analisis="No se han registrado factores de riesgo para analizar.",
            recomendaciones="Se sugiere registrar factores de riesgo para obtener recomendaciones específicas.",
            concepto_completo="Sin datos suficientes.",
            resumen_riesgos={"nivel_global": "Pendiente", "score_global": 0}
        )

    try:
        # Adaptar Datos -> EvaluacionRiesgo (para usar el servicio de ML existente)
        evaluaciones_adaptadas = []
        
        for cond in condiciones_input:
            # Mapear nivel de riesgo a calificación ('alto', 'medio', 'bajo')
            calificacion_str = 'bajo'
            interp = ""
            
            # Manejar diferencia entre Objeto DB y Pydantic Model
            if isinstance(cond, dict):
                # Si entrara como dict puro (raro con Pydantic models pero posible)
                interp = cond.get('interpretacion', '')
                dim = cond.get('dimension', '')
                item_n = cond.get('item_numero', 0)
                item_t = cond.get('item_texto', '')
                obs = cond.get('observaciones', '')
            else:
                # cond is Pydantic model (CondicionRiesgoAECreate)
                # Nota: El schema Create tiene 'condicion_texto' pero no 'item_texto'
                
                # Si viene del DB, tiene interpretacion.
                if hasattr(cond, 'interpretacion') and cond.interpretacion:
                    interp = cond.interpretacion
                elif hasattr(cond, 'total_condicion') and cond.total_condicion is not None:
                    # Estimación rápida
                    total = cond.total_condicion
                    if total >= 15: interp = 'Alto'
                    elif total >= 8: interp = 'Medio'
                    else: interp = 'Bajo'
                else:
                    # Tratar de calcular con freq/exp/int si están
                    try:
                        t = (cond.frecuencia or 0) + (cond.exposicion or 0) + (cond.intensidad or 0)
                        if t >= 15: interp = 'Alto'
                        elif t >= 8: interp = 'Medio'
                        else: interp = 'Bajo'
                    except:
                        interp = 'Bajo'

                dim = cond.dimension
                item_n = cond.item_numero
                # Usar condicion_texto si item_texto no existe (en el schema Create es condicion_texto)
                item_t = getattr(cond, 'item_texto', getattr(cond, 'condicion_texto', 'Item sin texto'))
                # Observaciones puede no estar en el schema Create
                obs = getattr(cond, 'observaciones', '')

            if interp:
                interp = interp.lower()
                if 'alto' in interp or 'muy alto' in interp or 'crítico' in interp:
                    calificacion_str = 'alto'
                elif 'medio' in interp:
                    calificacion_str = 'medio'
                elif 'bajo' in interp:
                    calificacion_str = 'bajo'
            
            # Crear objeto compatible
            # IMPORTANTE: Asegurar que los tipos sean correctos para evitar Pydantic Validations Errors ocultos
            
            # Cast dimension to string value to create CategoriaRiesgo
            dim_val = dim.value if hasattr(dim, 'value') else str(dim)
            try:
                cat_enum = CategoriaRiesgo(dim_val)
            except ValueError:
                # Fallback if dimension string doesn't match CategoriaRiesgo exactly
                # Try to find by name or just use the raw string if SQLModel allows (it might fail if strict)
                print(f"Advertencia: Dimensión '{dim_val}' no coincide con CategoriaRiesgo")
                cat_enum = dim_val # Risky if validation is strict

            # Cast calificacion to CalificacionRiesgo
            try:
                cal_enum = CalificacionRiesgo(calificacion_str)
            except:
                cal_enum = CalificacionRiesgo.BAJO

            eval_obj = EvaluacionRiesgo(
                id=0, # Dummy
                valoracion_id=0, # Dummy
                categoria=cat_enum, 
                item_numero=item_n,
                item_texto=str(item_t) if item_t else f"Item {item_n}",
                calificacion=cal_enum,
                observaciones=str(obs) if obs else None
            )
            evaluaciones_adaptadas.append(eval_obj)

        # Obtener Cargo y Empresa para la generación personalizada
        cargo_trabajador = "trabajador"
        empresa_nombre = "la empresa"
        
        # Intentar obtener de BD si tenemos AE_id
        if request.AE_id:
             # Ya consultamos trabajador y empresa arriba, pero aseguramos
            if not 'trabajador' in locals() or not trabajador:
                trabajador = session.exec(select(TrabajadorAE).where(TrabajadorAE.AE_id == request.AE_id)).first()
            if not 'empresa' in locals() or isinstance(empresa, str): # Evitar conflicto de nombre si existe variable empresa string
                 empresa_db = session.exec(select(DatosEmpresaAE).where(DatosEmpresaAE.AE_id == request.AE_id)).first()
            else:
                 empresa_db = empresa # Asumiendo que es el objeto DB
            
            if trabajador and trabajador.cargo:
                cargo_trabajador = trabajador.cargo
            if empresa_db and empresa_db.empresa:
                empresa_nombre = empresa_db.empresa
                
        # 5. Generar concepto con el nuevo servicio dedicado
        resultado = generar_concepto_analisis_exigencia_mental(
            evaluaciones=evaluaciones_adaptadas,
            nombre_trabajador=nombre_trabajador,
            tiene_diagnostico_mental=False,
            cargo=cargo_trabajador,
            empresa=empresa_nombre
        )
        
        # 6. Obtener resumen cuantitativo
        from app.services.ml_concepto_generator import analizar_perfil_ml
        perfil = analizar_perfil_ml(evaluaciones_adaptadas)
        
        return ConceptoAEResponse(
            analisis=resultado["analisis"],
            recomendaciones=resultado["recomendaciones"],
            concepto_completo=resultado["concepto_completo"],
            resumen_riesgos={
                'nivel_global': perfil['severidad_global'],
                'score_global': round(perfil['score_global'], 2)
            }
        )
    except Exception as e:
        import traceback
        # Log to file for debugging - Use absolute path or current dir explicitly
        try:
            log_path = os.path.join(os.getcwd(), "last_ml_error.txt")
            with open(log_path, "w") as f:
                f.write(f"Error en generar_concepto_AE: {str(e)}\n\n")
                f.write(f"Condiciones input types: {[type(c) for c in condiciones_input]}\n")
                traceback.print_exc(file=f)
        except:
            print("Error escribiendo log de error ML")
            
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno en generador IA: {str(e)}")


# ===== LISTAR AES DE TRABAJO =====
@router.get("/", response_model=PaginatedAEsResponse)
def listar_AEs(
    skip: int = 0,
    limit: int = 10,
    estado: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista todas las AEs de trabajo del usuario"""
    
    # Base query for filtering
    if current_user.rol == "admin":
        base_query = select(AnalisisExigenciaMental)
    else:
        base_query = select(AnalisisExigenciaMental).where(
            AnalisisExigenciaMental.creado_por == current_user.id
        )
    
    # Apply estado filter if provided
    if estado and estado != 'todos':
        base_query = base_query.where(AnalisisExigenciaMental.estado == estado)
    
    # Get total count
    from sqlmodel import func
    count_query = select(func.count()).select_from(base_query.subquery())
    total = session.exec(count_query).one()
    
    # Get paginated items
    statement = base_query.offset(skip).limit(limit).order_by(AnalisisExigenciaMental.fecha_creacion.desc())
    AEs = session.exec(statement).all()
    
    # Construir respuesta con datos relacionados
    resultado = []
    for AE in AEs:
        trabajador = session.exec(
            select(TrabajadorAE).where(TrabajadorAE.AE_id == AE.id)
        ).first()
        
        empresa = session.exec(
            select(DatosEmpresaAE).where(DatosEmpresaAE.AE_id == AE.id)
        ).first()
        
        resultado.append(AnalisisExigenciaMentalListItem(
            id=AE.id,
            estado=AE.estado,
            fecha_creacion=AE.fecha_creacion,
            fecha_actualizacion=AE.fecha_actualizacion,
            trabajador_nombre=trabajador.nombre if trabajador else None,
            trabajador_identificacion=trabajador.identificacion if trabajador else None,
            empresa=empresa.empresa if empresa else None
        ))
    
    return PaginatedAEsResponse(items=resultado, total=total)


# ===== OBTENER AE POR ID =====
@router.get("/{AE_id:int}", response_model=AnalisisExigenciaMentalResponse)
def obtener_AE(
    AE_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene una AE de trabajo por su ID"""
    
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE:
        raise HTTPException(status_code=404, detail="AE no encontrada")
    
    if current_user.rol == "psicologo" and AE.creado_por != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso para ver esta AE")
    
    # Cargar datos relacionados
    datos_empresa = session.exec(
        select(DatosEmpresaAE).where(DatosEmpresaAE.AE_id == AE_id)
    ).first()
    
    trabajador = session.exec(
        select(TrabajadorAE).where(TrabajadorAE.AE_id == AE_id)
    ).first()
    
    evaluador = session.exec(
        select(DatosEvaluadorAE).where(DatosEvaluadorAE.AE_id == AE_id)
    ).first()
    
    secciones = session.exec(
        select(SeccionesAE).where(SeccionesAE.AE_id == AE_id)
    ).first()
    
    condiciones = session.exec(
        select(CondicionRiesgoAE).where(CondicionRiesgoAE.AE_id == AE_id)
    ).all()
    
    resumen = session.exec(
        select(ResumenFactorAE).where(ResumenFactorAE.AE_id == AE_id)
    ).all()
    
    concepto = session.exec(
        select(ConceptoFinalAE).where(ConceptoFinalAE.AE_id == AE_id)
    ).first()
    
    return AnalisisExigenciaMentalResponse(
        id=AE.id,
        estado=AE.estado,
        creado_por=AE.creado_por,
        fecha_creacion=AE.fecha_creacion,
        fecha_actualizacion=AE.fecha_actualizacion,
        fecha_finalizacion=AE.fecha_finalizacion,
        datos_empresa=datos_empresa,
        trabajador=trabajador,
        evaluador=evaluador,
        secciones=secciones,
        condiciones_riesgo=list(condiciones),
        resumen_factores=list(resumen),
        concepto_final=concepto
    )


# ===== ELIMINAR AE DE TRABAJO =====
@router.delete("/{AE_id:int}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_AE(
    AE_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Elimina una AE de trabajo y todos sus datos relacionados"""
    
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE:
        raise HTTPException(status_code=404, detail="AE no encontrada")
    
    if current_user.rol == "psicologo" and AE.creado_por != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso para eliminar esta AE")
    
    # Eliminar datos relacionados en cascada
    # (El orden importa por las FK)
    session.exec(select(ConceptoFinalAE).where(ConceptoFinalAE.AE_id == AE_id))
    concepto = session.exec(select(ConceptoFinalAE).where(ConceptoFinalAE.AE_id == AE_id)).first()
    if concepto:
        session.delete(concepto)
    
    resumen_items = session.exec(select(ResumenFactorAE).where(ResumenFactorAE.AE_id == AE_id)).all()
    for item in resumen_items:
        session.delete(item)
    
    condiciones = session.exec(select(CondicionRiesgoAE).where(CondicionRiesgoAE.AE_id == AE_id)).all()
    for cond in condiciones:
        session.delete(cond)
    
    secciones = session.exec(select(SeccionesAE).where(SeccionesAE.AE_id == AE_id)).first()
    if secciones:
        session.delete(secciones)
    
    evaluador = session.exec(select(DatosEvaluadorAE).where(DatosEvaluadorAE.AE_id == AE_id)).first()
    if evaluador:
        session.delete(evaluador)
    
    trabajador = session.exec(select(TrabajadorAE).where(TrabajadorAE.AE_id == AE_id)).first()
    if trabajador:
        session.delete(trabajador)
    
    empresa = session.exec(select(DatosEmpresaAE).where(DatosEmpresaAE.AE_id == AE_id)).first()
    if empresa:
        session.delete(empresa)
    
    # Finalmente eliminar la AE principal
    session.delete(AE)
    session.commit()
    
    return None
# ===== CREAR NUEVA AE (MONOLÍTICA) =====
@router.post("/", response_model=AnalisisExigenciaMentalResponse, status_code=status.HTTP_201_CREATED)
def crear_analisis_exigencia_mental(
    AE_data: AnalisisExigenciaMentalCreate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Crea una nueva AE de trabajo completa"""
    
    # 1. Crear AE principal
    AE = AnalisisExigenciaMental(
        estado=EstadoAE.BORRADOR,
        creado_por=current_user.id,
        fecha_creacion=datetime.utcnow(),
        fecha_actualizacion=datetime.utcnow()
    )
    if AE_data.fecha_valoracion:
        pass # La fecha de valoración no está en el modelo principal, quizás debamos agregarla o usar fecha_creacion
             # Por ahora, usamos fecha_creacion
    
    session.add(AE)
    session.commit()
    session.refresh(AE)
    
    # 2. Crear datos empresa
    if AE_data.datos_empresa:
        empresa = DatosEmpresaAE(
            AE_id=AE.id,
            **AE_data.datos_empresa.model_dump()
        )
        session.add(empresa)
        
    # 3. Crear trabajador
    if AE_data.trabajador:
        trabajador = TrabajadorAE(
            AE_id=AE.id,
            **AE_data.trabajador.model_dump()
        )
        session.add(trabajador)
        
    # 4. Crear evaluador
    if AE_data.evaluador:
        evaluador = DatosEvaluadorAE(
            AE_id=AE.id,
            **AE_data.evaluador.model_dump()
        )
        session.add(evaluador)
        
    # 5. Crear secciones
    if AE_data.secciones:
        secciones = SeccionesAE(
            AE_id=AE.id,
            **AE_data.secciones.model_dump()
        )
        session.add(secciones)
        
    # 6. Crear condiciones de riesgo
    if AE_data.condiciones_riesgo:
        for cond_data in AE_data.condiciones_riesgo:
            # Calcular total si es necesario
            if cond_data.total_condicion is None and all([
                cond_data.frecuencia is not None,
                cond_data.exposicion is not None,
                cond_data.intensidad is not None
            ]):
                cond_data.total_condicion = (
                    cond_data.frecuencia +
                    cond_data.exposicion +
                    cond_data.intensidad
                )
            
            condicion = CondicionRiesgoAE(
                AE_id=AE.id,
                **cond_data.model_dump()
            )
            session.add(condicion)
            
    # 7. Crear resumen de factores
    if AE_data.resumen_factores:
        for res_data in AE_data.resumen_factores:
            resumen = ResumenFactorAE(
                AE_id=AE.id,
                **res_data.model_dump()
            )
            session.add(resumen)
            
    # 8. Crear concepto final
    if AE_data.concepto_final:
        concepto = ConceptoFinalAE(
            AE_id=AE.id,
            **AE_data.concepto_final.model_dump()
        )
        session.add(concepto)
        
    session.commit()
    session.refresh(AE)
    
    return obtener_AE(AE.id, session, current_user)


# ===== ACTUALIZAR AE (MONOLÍTICA) =====
@router.put("/{AE_id:int}", response_model=AnalisisExigenciaMentalResponse)
def actualizar_AE(
    AE_id: int,
    AE_data: AnalisisExigenciaMentalUpdate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualiza una AE de trabajo existente"""
    
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AE no encontrada"
        )
        
    # Verificar permisos
    if current_user.rol == "psicologo" and AE.creado_por != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permiso para editar esta AE"
        )
        
    # Actualizar campos básicos
    if AE_data.estado:
        AE.estado = AE_data.estado
        
    AE.fecha_actualizacion = datetime.utcnow()
    session.add(AE)
    
    # 1. Actualizar empresa
    if AE_data.datos_empresa:
        empresa = session.exec(select(DatosEmpresaAE).where(DatosEmpresaAE.AE_id == AE_id)).first()
        if empresa:
            for key, value in AE_data.datos_empresa.model_dump().items():
                setattr(empresa, key, value)
            empresa.updated_at = datetime.utcnow()
            session.add(empresa)
        else:
            empresa = DatosEmpresaAE(AE_id=AE_id, **AE_data.datos_empresa.model_dump())
            session.add(empresa)

    # 2. Actualizar trabajador
    if AE_data.trabajador:
        trabajador = session.exec(select(TrabajadorAE).where(TrabajadorAE.AE_id == AE_id)).first()
        if trabajador:
            for key, value in AE_data.trabajador.model_dump().items():
                setattr(trabajador, key, value)
            trabajador.updated_at = datetime.utcnow()
            session.add(trabajador)
        else:
            trabajador = TrabajadorAE(AE_id=AE_id, **AE_data.trabajador.model_dump())
            session.add(trabajador)

    # 3. Actualizar evaluador
    if AE_data.evaluador:
        evaluador = session.exec(select(DatosEvaluadorAE).where(DatosEvaluadorAE.AE_id == AE_id)).first()
        if evaluador:
            for key, value in AE_data.evaluador.model_dump().items():
                setattr(evaluador, key, value)
            evaluador.updated_at = datetime.utcnow()
            session.add(evaluador)
        else:
            evaluador = DatosEvaluadorAE(AE_id=AE_id, **AE_data.evaluador.model_dump())
            session.add(evaluador)

    # 4. Actualizar secciones
    if AE_data.secciones:
        secciones = session.exec(select(SeccionesAE).where(SeccionesAE.AE_id == AE_id)).first()
        if secciones:
            for key, value in AE_data.secciones.model_dump().items():
                setattr(secciones, key, value)
            secciones.updated_at = datetime.utcnow()
            session.add(secciones)
        else:
            secciones = SeccionesAE(AE_id=AE_id, **AE_data.secciones.model_dump())
            session.add(secciones)

    # 5. Actualizar condiciones de riesgo (Reemplazo total)
    if AE_data.condiciones_riesgo is not None:
        # Eliminar existentes
        existentes = session.exec(select(CondicionRiesgoAE).where(CondicionRiesgoAE.AE_id == AE_id)).all()
        for item in existentes:
            session.delete(item)
            
        # Crear nuevos
        for cond_data in AE_data.condiciones_riesgo:
            if cond_data.total_condicion is None and all([
                cond_data.frecuencia is not None,
                cond_data.exposicion is not None,
                cond_data.intensidad is not None
            ]):
                cond_data.total_condicion = (
                    cond_data.frecuencia +
                    cond_data.exposicion +
                    cond_data.intensidad
                )
            
            condicion = CondicionRiesgoAE(AE_id=AE_id, **cond_data.model_dump())
            session.add(condicion)

    # 6. Actualizar resumen de factores (Reemplazo total)
    if AE_data.resumen_factores is not None:
        # Eliminar existentes
        existentes = session.exec(select(ResumenFactorAE).where(ResumenFactorAE.AE_id == AE_id)).all()
        for item in existentes:
            session.delete(item)
            
        # Crear nuevos
        for res_data in AE_data.resumen_factores:
            resumen = ResumenFactorAE(AE_id=AE_id, **res_data.model_dump())
            session.add(resumen)

    # 7. Actualizar concepto final
    if AE_data.concepto_final:
        concepto = session.exec(select(ConceptoFinalAE).where(ConceptoFinalAE.AE_id == AE_id)).first()
        
        # Manejo de firma (Base64 -> Archivo)
        firma_path = None
        if AE_data.concepto_final.firma_evaluador and AE_data.concepto_final.firma_evaluador.startswith('data:image'):
            try:
                import base64
                import uuid
                import os
                
                # Crear directorio si no existe
                upload_dir = "static/uploads/signatures"
                os.makedirs(upload_dir, exist_ok=True)
                
                # Decodificar imagen
                header, encoded = AE_data.concepto_final.firma_evaluador.split(",", 1)
                data = base64.b64decode(encoded)
                
                # Generar nombre único
                filename = f"signature_{AE_id}_{uuid.uuid4().hex[:8]}.png"
                file_path = os.path.join(upload_dir, filename)
                
                # Guardar archivo
                with open(file_path, "wb") as f:
                    f.write(data)
                
                firma_path = file_path
                # Actualizar el campo en el objeto de datospara que se guarde el path
                AE_data.concepto_final.firma_evaluador = firma_path
            except Exception as e:
                print(f"Error guardando firma: {e}")
                # En caso de error, mantenemos el valor original (que fallará en el PDF pero no rompe el flujo)

        if concepto:
            for key, value in AE_data.concepto_final.model_dump().items():
                # Solo actualizar si no es None, para no borrar datos si viene parcial
                if value is not None:
                    # Si acabamos de procesar la firma, asegurarse de usar el path
                    if key == 'firma_evaluador' and firma_path:
                        setattr(concepto, key, firma_path)
                    else:
                        setattr(concepto, key, value)
            concepto.updated_at = datetime.utcnow()
            session.add(concepto)
        else:
            # Si es nuevo concepto, data_model.dump ya tiene el path si lo modificamos arriba
            concepto = ConceptoFinalAE(AE_id=AE_id, **AE_data.concepto_final.model_dump())
            session.add(concepto)

    session.commit()
    session.refresh(AE)
    
    return obtener_AE(AE.id, session, current_user)


# ===== FINALIZAR AE Y GENERAR PDF =====
@router.post("/{AE_id:int}/finalizar", response_model=FinalizarAEResponse)
def finalizar_AE(
    AE_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Finaliza la AE y genera el PDF"""

    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE:
        raise HTTPException(status_code=404, detail="AE no encontrada")

    if current_user.rol == "psicologo" and AE.creado_por != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso")

    # If already completed, just regenerate the PDF
    regenerando = AE.estado == EstadoAE.COMPLETADA

    # Cargar todas las relaciones necesarias para el PDF
    datos_empresa = session.exec(
        select(DatosEmpresaAE).where(DatosEmpresaAE.AE_id == AE_id)
    ).first()

    trabajador = session.exec(
        select(TrabajadorAE).where(TrabajadorAE.AE_id == AE_id)
    ).first()

    evaluador = session.exec(
        select(DatosEvaluadorAE).where(DatosEvaluadorAE.AE_id == AE_id)
    ).first()

    secciones = session.exec(
        select(SeccionesAE).where(SeccionesAE.AE_id == AE_id)
    ).first()

    condiciones = session.exec(
        select(CondicionRiesgoAE).where(CondicionRiesgoAE.AE_id == AE_id)
        .order_by(CondicionRiesgoAE.dimension, CondicionRiesgoAE.item_numero)
    ).all()

    resumen = session.exec(
        select(ResumenFactorAE).where(ResumenFactorAE.AE_id == AE_id)
        .order_by(ResumenFactorAE.dimension)
    ).all()

    concepto = session.exec(
        select(ConceptoFinalAE).where(ConceptoFinalAE.AE_id == AE_id)
    ).first()

    try:
        # Generar PDF
        pdf_path = generar_pdf_analisis_exigencia_mental(
            AE=AE,
            datos_empresa=datos_empresa,
            trabajador=trabajador,
            evaluador=evaluador,
            secciones=secciones,
            condiciones_riesgo=list(condiciones),
            resumen_factores=list(resumen),
            concepto_final=concepto,
            output_dir="pdfs"
        )

        pdf_filename = Path(pdf_path).name
        pdf_url = f"/pdfs/{pdf_filename}"

        # Cambiar estado a completada
        AE.estado = EstadoAE.COMPLETADA
        AE.fecha_finalizacion = datetime.utcnow()
        AE.fecha_actualizacion = datetime.utcnow()
        session.add(AE)
        session.commit()
        session.refresh(AE)

        return FinalizarAEResponse(
            message="AE finalizada exitosamente",
            AE_id=AE.id,
            pdf_url=pdf_url
        )

    except Exception as e:
        session.rollback()
        AE.estado = EstadoAE.BORRADOR
        session.add(AE)
        session.commit()
        raise HTTPException(
            status_code=500,
            detail=f"Error al finalizar AE: {str(e)}"
        )




# ===== SUB-ENDPOINTS INDIVIDUALES =====
@router.get("/{AE_id:int}/secciones", response_model=SeccionesAERead)
def obtener_secciones(AE_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE: raise HTTPException(status_code=404, detail="AE no encontrada")
    secciones = session.exec(select(SeccionesAE).where(SeccionesAE.AE_id == AE_id)).first()
    if not secciones: return {} # Devolver vacio si no existe
    return secciones

@router.post("/{AE_id:int}/secciones")
def guardar_secciones(AE_id: int, request: dict, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE: raise HTTPException(status_code=404, detail="AE no encontrada")
    secciones = session.exec(select(SeccionesAE).where(SeccionesAE.AE_id == AE_id)).first()
    if secciones:
        for key, value in request.items():
            if hasattr(secciones, key) and key != 'id' and key != 'AE_id':
                setattr(secciones, key, value)
        secciones.updated_at = datetime.utcnow()
        session.add(secciones)
    else:
        # Filtrar campos validos
        valid_keys = SeccionesAECreate.__fields__.keys()
        data = {k: v for k, v in request.items() if k in valid_keys}
        secciones = SeccionesAE(AE_id=AE_id, **data)
        session.add(secciones)
    session.commit()
    return {"msg": "Secciones guardadas correctamente"}

@router.get("/{AE_id:int}/condiciones-riesgo")
def obtener_condiciones_riesgo(AE_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE: raise HTTPException(status_code=404, detail="AE no encontrada")
    condiciones = session.exec(select(CondicionRiesgoAE).where(CondicionRiesgoAE.AE_id == AE_id)).all()
    return condiciones

@router.post("/{AE_id:int}/condiciones-riesgo")
def guardar_condicion_riesgo(AE_id: int, request: dict, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE: raise HTTPException(status_code=404, detail="AE no encontrada")
    
    dimension = request.get('dimension')
    item_numero = request.get('item_numero')
    
    if not dimension or item_numero is None:
        raise HTTPException(status_code=400, detail="Falta dimension o item_numero")
        
    condicion = session.exec(
        select(CondicionRiesgoAE)
        .where(CondicionRiesgoAE.AE_id == AE_id)
        .where(CondicionRiesgoAE.dimension == dimension)
        .where(CondicionRiesgoAE.item_numero == item_numero)
    ).first()
    
    if condicion:
        for key, value in request.items():
            if hasattr(condicion, key) and key != 'id' and key != 'AE_id':
                setattr(condicion, key, value)
        condicion.updated_at = datetime.utcnow()
        session.add(condicion)
    else:
        valid_keys = CondicionRiesgoAECreate.__fields__.keys()
        data = {k: v for k, v in request.items() if k in valid_keys}
        condicion = CondicionRiesgoAE(AE_id=AE_id, **data)
        session.add(condicion)
        
    session.commit()
    return {"msg": "Condicion guardada correctamente"}

@router.get("/{AE_id:int}/resumen-factores")
def obtener_resumen_factores(AE_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE: raise HTTPException(status_code=404, detail="AE no encontrada")
    resumenes = session.exec(select(ResumenFactorAE).where(ResumenFactorAE.AE_id == AE_id)).all()
    return resumenes

@router.post("/{AE_id:int}/resumen-factores")
def guardar_resumen_factor(AE_id: int, request: dict, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE: raise HTTPException(status_code=404, detail="AE no encontrada")
    
    dimension = request.get('dimension')
    if not dimension:
        raise HTTPException(status_code=400, detail="Falta dimension")
        
    resumen = session.exec(
        select(ResumenFactorAE)
        .where(ResumenFactorAE.AE_id == AE_id)
        .where(ResumenFactorAE.dimension == dimension)
    ).first()
    
    # Check for empty strings in NivelRiesgo enums
    if request.get('nivel_riesgo_trabajador') == '':
        request['nivel_riesgo_trabajador'] = None
    if request.get('nivel_riesgo_experto') == '':
        request['nivel_riesgo_experto'] = None
        
    if resumen:
        for key, value in request.items():
            if hasattr(resumen, key) and key != 'id' and key != 'AE_id':
                setattr(resumen, key, value)
        resumen.updated_at = datetime.utcnow()
        session.add(resumen)
    else:
        valid_keys = ResumenFactorAECreate.__fields__.keys()
        data = {k: v for k, v in request.items() if k in valid_keys}
        resumen = ResumenFactorAE(AE_id=AE_id, **data)
        session.add(resumen)
        
    session.commit()
    return {"msg": "Resumen guardado correctamente"}

@router.get("/{AE_id:int}/concepto-final")
def obtener_concepto_final(AE_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE: raise HTTPException(status_code=404, detail="AE no encontrada")
    concepto = session.exec(select(ConceptoFinalAE).where(ConceptoFinalAE.AE_id == AE_id)).first()
    if not concepto: return {} # Devolver vacio si no existe
    return concepto

@router.post("/{AE_id:int}/concepto-final")
def guardar_concepto_final(AE_id: int, request: dict, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE: raise HTTPException(status_code=404, detail="AE no encontrada")
    concepto = session.exec(select(ConceptoFinalAE).where(ConceptoFinalAE.AE_id == AE_id)).first()
    
    if concepto:
        for key, value in request.items():
            # Special case to store signature natively later or ignore empty string for signature
            if key == 'firma_evaluador' and not value:
                continue
            if hasattr(concepto, key) and key != 'id' and key != 'AE_id':
                setattr(concepto, key, value)
        concepto.updated_at = datetime.utcnow()
        session.add(concepto)
    else:
        valid_keys = ConceptoFinalAECreate.__fields__.keys()
        data = {k: v for k, v in request.items() if k in valid_keys}
        concepto = ConceptoFinalAE(AE_id=AE_id, **data)
        session.add(concepto)
        
    session.commit()
    return {"msg": "Concepto final guardado correctamente"}

# ===== DESCARGAR PDF =====
@router.get("/{AE_id:int}/descargar-pdf")
def descargar_pdf(
    AE_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Descarga el PDF de una AE completada"""

    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE:
        raise HTTPException(status_code=404, detail="AE no encontrada")

    if current_user.rol == "psicologo" and AE.creado_por != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso")

    if AE.estado != EstadoAE.COMPLETADA:
        raise HTTPException(
            status_code=400,
            detail="La AE debe estar completada para descargar el PDF"
        )

    # Cargar todas las relaciones
    datos_empresa = session.exec(
        select(DatosEmpresaAE).where(DatosEmpresaAE.AE_id == AE_id)
    ).first()

    trabajador = session.exec(
        select(TrabajadorAE).where(TrabajadorAE.AE_id == AE_id)
    ).first()

    evaluador = session.exec(
        select(DatosEvaluadorAE).where(DatosEvaluadorAE.AE_id == AE_id)
    ).first()

    secciones = session.exec(
        select(SeccionesAE).where(SeccionesAE.AE_id == AE_id)
    ).first()

    condiciones = session.exec(
        select(CondicionRiesgoAE).where(CondicionRiesgoAE.AE_id == AE_id)
        .order_by(CondicionRiesgoAE.dimension, CondicionRiesgoAE.item_numero)
    ).all()

    resumen = session.exec(
        select(ResumenFactorAE).where(ResumenFactorAE.AE_id == AE_id)
        .order_by(ResumenFactorAE.dimension)
    ).all()

    concepto = session.exec(
        select(ConceptoFinalAE).where(ConceptoFinalAE.AE_id == AE_id)
    ).first()

    try:
        # Generar PDF
        print(f"Iniciando generación de PDF para AE {AE_id}")
        print(f"  - Estado AE: {AE.estado}")
        print(f"  - Datos empresa: {datos_empresa is not None}")
        print(f"  - Trabajador: {trabajador is not None}")
        print(f"  - Evaluador: {evaluador is not None}")
        print(f"  - Secciones: {secciones is not None}")
        print(f"  - Condiciones: {len(condiciones)}")
        print(f"  - Resumen: {len(resumen)}")
        print(f"  - Concepto: {concepto is not None}")
        
        pdf_path = generar_pdf_analisis_exigencia_mental(
            AE=AE,
            datos_empresa=datos_empresa,
            trabajador=trabajador,
            evaluador=evaluador,
            secciones=secciones,
            condiciones_riesgo=list(condiciones),
            resumen_factores=list(resumen),
            concepto_final=concepto,
            output_dir="pdfs"
        )

        print(f"PDF generado exitosamente: {pdf_path}")
        filename = os.path.basename(pdf_path)

        # Retornar archivo físico
        return FileResponse(
            path=pdf_path,
            filename=filename,
            media_type="application/pdf"
        )

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error generando PDF: {e}")
        print(f"Traceback completo:\n{error_trace}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar el PDF: {str(e)}"
        )

# ===== GENERACIÓN DE CONCEPTOS CON IA (NUEVO) =====

# ===== GENERACIÓN DE CONCEPTOS CON IA (NUEVO) =====

class GenerarConceptoAERequest(BaseModel):
    AE_id: Optional[int] = None
    # Datos opcionales para generación sin guardar
    nombre_trabajador: Optional[str] = None
    condiciones_riesgo: Optional[List[CondicionRiesgoAECreate]] = None

class ConceptoAEResponse(BaseModel):
    analisis: str
    recomendaciones: str
    concepto_completo: str
    resumen_riesgos: Dict

from app.services.ml_analisis_exigencia_mental_generator import generar_concepto_analisis_exigencia_mental
from app.models.evaluacion import EvaluacionRiesgo, CategoriaRiesgo, CalificacionRiesgo

@router.post("/generar-concepto", response_model=ConceptoAEResponse)
def generar_concepto_AE(
    request: GenerarConceptoAERequest,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Genera análisis y recomendaciones automáticas para una AE de Trabajo.
    Puede funcionar con un ID de AE existente O con datos enviados directamente.
    """
    
    nombre_trabajador = "el trabajador"
    condiciones_input = []
    
    # ESTRATEGIA 1: Usar AE existente
    if request.AE_id:
        AE = session.get(AnalisisExigenciaMental, request.AE_id)
        if not AE:
            raise HTTPException(status_code=404, detail="AE no encontrada")

        if current_user.rol == "psicologo" and AE.creado_por != current_user.id:
            raise HTTPException(status_code=403, detail="Sin permiso")
            
        # Obtener datos de DB
        trabajador = session.exec(select(TrabajadorAE).where(TrabajadorAE.AE_id == request.AE_id)).first()
        nombre_trabajador = trabajador.nombre_completo if trabajador else "el trabajador"
        
        condiciones_db = session.exec(select(CondicionRiesgoAE).where(CondicionRiesgoAE.AE_id == request.AE_id)).all()
        
        # Convertir a formato común (usamos la estructura de CondicionRiesgoAECreate/DB como base)
        condiciones_input = condiciones_db
        
    # ESTRATEGIA 2: Usar datos enviados (Direct Generation without Save)
    elif request.condiciones_riesgo:
        nombre_trabajador = request.nombre_trabajador or "el trabajador"
        condiciones_input = request.condiciones_riesgo
        
    else:
        raise HTTPException(status_code=400, detail="Debe proporcionar AE_id o condiciones_riesgo")

    if not condiciones_input:
        # Retornar vacío amigable en lugar de error si no hay riesgos marcados
        return ConceptoAEResponse(
            analisis="No se han registrado factores de riesgo para analizar.",
            recomendaciones="Se sugiere registrar factores de riesgo para obtener recomendaciones específicas.",
            concepto_completo="Sin datos suficientes.",
            resumen_riesgos={"nivel_global": "Pendiente", "score_global": 0}
        )

    try:
        # Adaptar Datos -> EvaluacionRiesgo (para usar el servicio de ML existente)
        evaluaciones_adaptadas = []
        
        for cond in condiciones_input:
            # Mapear nivel de riesgo a calificación ('alto', 'medio', 'bajo')
            calificacion_str = 'bajo'
            interp = ""
            
            # Manejar diferencia entre Objeto DB y Pydantic Model
            if isinstance(cond, dict):
                # Si entrara como dict puro (raro con Pydantic models pero posible)
                interp = cond.get('interpretacion', '')
                dim = cond.get('dimension', '')
                item_n = cond.get('item_numero', 0)
                item_t = cond.get('item_texto', '')
                obs = cond.get('observaciones', '')
            else:
                # cond is Pydantic model (CondicionRiesgoAECreate)
                # Nota: El schema Create tiene 'condicion_texto' pero no 'item_texto'
                
                # Si viene del DB, tiene interpretacion.
                if hasattr(cond, 'interpretacion') and cond.interpretacion:
                    interp = cond.interpretacion
                elif hasattr(cond, 'total_condicion') and cond.total_condicion is not None:
                    # Estimación rápida
                    total = cond.total_condicion
                    if total >= 15: interp = 'Alto'
                    elif total >= 8: interp = 'Medio'
                    else: interp = 'Bajo'
                else:
                    # Tratar de calcular con freq/exp/int si están
                    try:
                        t = (cond.frecuencia or 0) + (cond.exposicion or 0) + (cond.intensidad or 0)
                        if t >= 15: interp = 'Alto'
                        elif t >= 8: interp = 'Medio'
                        else: interp = 'Bajo'
                    except:
                        interp = 'Bajo'

                dim = cond.dimension
                item_n = cond.item_numero
                # Usar condicion_texto si item_texto no existe (en el schema Create es condicion_texto)
                item_t = getattr(cond, 'item_texto', getattr(cond, 'condicion_texto', 'Item sin texto'))
                # Observaciones puede no estar en el schema Create
                obs = getattr(cond, 'observaciones', '')

            if interp:
                interp = interp.lower()
                if 'alto' in interp or 'muy alto' in interp or 'crítico' in interp:
                    calificacion_str = 'alto'
                elif 'medio' in interp:
                    calificacion_str = 'medio'
                elif 'bajo' in interp:
                    calificacion_str = 'bajo'
            
            # Crear objeto compatible
            # IMPORTANTE: Asegurar que los tipos sean correctos para evitar Pydantic Validations Errors ocultos
            eval_obj = EvaluacionRiesgo(
                id=0, # Dummy
                valoracion_id=0, # Dummy
                categoria=dim, 
                item_numero=item_n,
                item_texto=str(item_t) if item_t else f"Item {item_n}",
                calificacion=calificacion_str,
                observaciones=str(obs) if obs else None
            )
            evaluaciones_adaptadas.append(eval_obj)

        # 5. Generar concepto con el nuevo servicio dedicado
        resultado = generar_concepto_analisis_exigencia_mental(
            evaluaciones=evaluaciones_adaptadas,
            nombre_trabajador=nombre_trabajador,
            tiene_diagnostico_mental=False 
        )
        
        # 6. Obtener resumen cuantitativo
        from app.services.ml_concepto_generator import analizar_perfil_ml
        perfil = analizar_perfil_ml(evaluaciones_adaptadas)
        
        return ConceptoAEResponse(
            analisis=resultado["analisis"],
            recomendaciones=resultado["recomendaciones"],
            concepto_completo=resultado["concepto_completo"],
            resumen_riesgos={
                'nivel_global': perfil['severidad_global'],
                'score_global': round(perfil['score_global'], 2)
            }
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno en generador IA: {str(e)}")

