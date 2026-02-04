"""
Router para el módulo de Pruebas de Trabajo
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
from app.models.prueba_trabajo import (
    PruebaTrabajo, TrabajadorPrueba, DatosEmpresaPrueba,
    DatosEvaluador, SeccionesPrueba, CondicionRiesgoPrueba,
    ResumenFactorPrueba, ConceptoFinalPrueba, EstadoPrueba
)
from app.schemas.prueba_trabajo import (
    PruebaTrabajoCreate, PruebaTrabajoResponse, PruebaTrabajoListItem,
    PruebaTrabajoUpdate, PaginatedPruebasResponse,
    DatosEmpresaPruebaCreate, TrabajadorPruebaCreate, DatosEvaluadorCreate,
    SeccionesPruebaCreate, CondicionRiesgoPruebaCreate, ResumenFactorPruebaCreate,
    ConceptoFinalPruebaCreate, FinalizarPruebaResponse
)
from app.services.auth import get_current_user
from app.services.pdf_generator_prueba_trabajo import generar_pdf_prueba_trabajo

router = APIRouter(prefix="/pruebas-trabajo", tags=["Pruebas de Trabajo"])



# ===== GENERACIÓN DE CONCEPTOS CON IA (NUEVO) =====

class GenerarConceptoPruebaRequest(BaseModel):
    prueba_id: Optional[int] = None
    # Datos opcionales para generación sin guardar
    nombre_trabajador: Optional[str] = None
    condiciones_riesgo: Optional[List[CondicionRiesgoPruebaCreate]] = None

class ConceptoPruebaResponse(BaseModel):
    analisis: str
    recomendaciones: str
    concepto_completo: str
    resumen_riesgos: Dict

from app.services.ml_prueba_trabajo_generator import generar_concepto_prueba_trabajo
from app.models.evaluacion import EvaluacionRiesgo, CategoriaRiesgo, CalificacionRiesgo

@router.post("/generar-concepto-ia", response_model=ConceptoPruebaResponse)
def generar_concepto_prueba(
    request: GenerarConceptoPruebaRequest,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Genera análisis y recomendaciones automáticas para una Prueba de Trabajo.
    Puede funcionar con un ID de prueba existente O con datos enviados directamente.
    """
    
    nombre_trabajador = "el trabajador"
    condiciones_input = []
    
    # ESTRATEGIA 1: Usar prueba existente
    if request.prueba_id:
        prueba = session.get(PruebaTrabajo, request.prueba_id)
        if not prueba:
            raise HTTPException(status_code=404, detail="Prueba no encontrada")

        if current_user.rol == "psicologo" and prueba.creado_por != current_user.id:
            raise HTTPException(status_code=403, detail="Sin permiso")
            
        # Obtener datos de DB
        trabajador = session.exec(select(TrabajadorPrueba).where(TrabajadorPrueba.prueba_id == request.prueba_id)).first()
        nombre_trabajador = trabajador.nombre if trabajador else "el trabajador"
        
        condiciones_db = session.exec(select(CondicionRiesgoPrueba).where(CondicionRiesgoPrueba.prueba_id == request.prueba_id)).all()
        
        # Convertir a formato común (usamos la estructura de CondicionRiesgoPruebaCreate/DB como base)
        condiciones_input = condiciones_db
        
    # ESTRATEGIA 2: Usar datos enviados (Direct Generation without Save)
    elif request.condiciones_riesgo:
        nombre_trabajador = request.nombre_trabajador or "el trabajador"
        condiciones_input = request.condiciones_riesgo
        
    else:
        raise HTTPException(status_code=400, detail="Debe proporcionar prueba_id o condiciones_riesgo")

    if not condiciones_input:
        # Retornar vacío amigable en lugar de error si no hay riesgos marcados
        return ConceptoPruebaResponse(
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
                # cond is Pydantic model (CondicionRiesgoPruebaCreate)
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

        # 5. Generar concepto con el nuevo servicio dedicado
        resultado = generar_concepto_prueba_trabajo(
            evaluaciones=evaluaciones_adaptadas,
            nombre_trabajador=nombre_trabajador,
            tiene_diagnostico_mental=False 
        )
        
        # 6. Obtener resumen cuantitativo
        from app.services.ml_concepto_generator import analizar_perfil_ml
        perfil = analizar_perfil_ml(evaluaciones_adaptadas)
        
        return ConceptoPruebaResponse(
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
                f.write(f"Error en generar_concepto_prueba: {str(e)}\n\n")
                f.write(f"Condiciones input types: {[type(c) for c in condiciones_input]}\n")
                traceback.print_exc(file=f)
        except:
            print("Error escribiendo log de error ML")
            
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno en generador IA: {str(e)}")


# ===== LISTAR PRUEBAS DE TRABAJO =====
@router.get("/", response_model=PaginatedPruebasResponse)
def listar_pruebas(
    skip: int = 0,
    limit: int = 10,
    estado: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista todas las pruebas de trabajo del usuario"""
    
    # Base query for filtering
    if current_user.rol == "admin":
        base_query = select(PruebaTrabajo)
    else:
        base_query = select(PruebaTrabajo).where(
            PruebaTrabajo.creado_por == current_user.id
        )
    
    # Apply estado filter if provided
    if estado and estado != 'todos':
        base_query = base_query.where(PruebaTrabajo.estado == estado)
    
    # Get total count
    from sqlmodel import func
    count_query = select(func.count()).select_from(base_query.subquery())
    total = session.exec(count_query).one()
    
    # Get paginated items
    statement = base_query.offset(skip).limit(limit).order_by(PruebaTrabajo.fecha_creacion.desc())
    pruebas = session.exec(statement).all()
    
    # Construir respuesta con datos relacionados
    resultado = []
    for prueba in pruebas:
        trabajador = session.exec(
            select(TrabajadorPrueba).where(TrabajadorPrueba.prueba_id == prueba.id)
        ).first()
        
        empresa = session.exec(
            select(DatosEmpresaPrueba).where(DatosEmpresaPrueba.prueba_id == prueba.id)
        ).first()
        
        resultado.append(PruebaTrabajoListItem(
            id=prueba.id,
            estado=prueba.estado,
            fecha_creacion=prueba.fecha_creacion,
            fecha_actualizacion=prueba.fecha_actualizacion,
            trabajador_nombre=trabajador.nombre if trabajador else None,
            trabajador_identificacion=trabajador.identificacion if trabajador else None,
            empresa=empresa.empresa if empresa else None
        ))
    
    return PaginatedPruebasResponse(items=resultado, total=total)


# ===== OBTENER PRUEBA POR ID =====
@router.get("/{prueba_id:int}", response_model=PruebaTrabajoResponse)
def obtener_prueba(
    prueba_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene una prueba de trabajo por su ID"""
    
    prueba = session.get(PruebaTrabajo, prueba_id)
    if not prueba:
        raise HTTPException(status_code=404, detail="Prueba no encontrada")
    
    if current_user.rol == "psicologo" and prueba.creado_por != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso para ver esta prueba")
    
    # Cargar datos relacionados
    datos_empresa = session.exec(
        select(DatosEmpresaPrueba).where(DatosEmpresaPrueba.prueba_id == prueba_id)
    ).first()
    
    trabajador = session.exec(
        select(TrabajadorPrueba).where(TrabajadorPrueba.prueba_id == prueba_id)
    ).first()
    
    evaluador = session.exec(
        select(DatosEvaluador).where(DatosEvaluador.prueba_id == prueba_id)
    ).first()
    
    secciones = session.exec(
        select(SeccionesPrueba).where(SeccionesPrueba.prueba_id == prueba_id)
    ).first()
    
    condiciones = session.exec(
        select(CondicionRiesgoPrueba).where(CondicionRiesgoPrueba.prueba_id == prueba_id)
    ).all()
    
    resumen = session.exec(
        select(ResumenFactorPrueba).where(ResumenFactorPrueba.prueba_id == prueba_id)
    ).all()
    
    concepto = session.exec(
        select(ConceptoFinalPrueba).where(ConceptoFinalPrueba.prueba_id == prueba_id)
    ).first()
    
    return PruebaTrabajoResponse(
        id=prueba.id,
        estado=prueba.estado,
        creado_por=prueba.creado_por,
        fecha_creacion=prueba.fecha_creacion,
        fecha_actualizacion=prueba.fecha_actualizacion,
        fecha_finalizacion=prueba.fecha_finalizacion,
        datos_empresa=datos_empresa,
        trabajador=trabajador,
        evaluador=evaluador,
        secciones=secciones,
        condiciones_riesgo=list(condiciones),
        resumen_factores=list(resumen),
        concepto_final=concepto
    )


# ===== ELIMINAR PRUEBA DE TRABAJO =====
@router.delete("/{prueba_id:int}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_prueba(
    prueba_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Elimina una prueba de trabajo y todos sus datos relacionados"""
    
    prueba = session.get(PruebaTrabajo, prueba_id)
    if not prueba:
        raise HTTPException(status_code=404, detail="Prueba no encontrada")
    
    if current_user.rol == "psicologo" and prueba.creado_por != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso para eliminar esta prueba")
    
    # Eliminar datos relacionados en cascada
    # (El orden importa por las FK)
    session.exec(select(ConceptoFinalPrueba).where(ConceptoFinalPrueba.prueba_id == prueba_id))
    concepto = session.exec(select(ConceptoFinalPrueba).where(ConceptoFinalPrueba.prueba_id == prueba_id)).first()
    if concepto:
        session.delete(concepto)
    
    resumen_items = session.exec(select(ResumenFactorPrueba).where(ResumenFactorPrueba.prueba_id == prueba_id)).all()
    for item in resumen_items:
        session.delete(item)
    
    condiciones = session.exec(select(CondicionRiesgoPrueba).where(CondicionRiesgoPrueba.prueba_id == prueba_id)).all()
    for cond in condiciones:
        session.delete(cond)
    
    secciones = session.exec(select(SeccionesPrueba).where(SeccionesPrueba.prueba_id == prueba_id)).first()
    if secciones:
        session.delete(secciones)
    
    evaluador = session.exec(select(DatosEvaluador).where(DatosEvaluador.prueba_id == prueba_id)).first()
    if evaluador:
        session.delete(evaluador)
    
    trabajador = session.exec(select(TrabajadorPrueba).where(TrabajadorPrueba.prueba_id == prueba_id)).first()
    if trabajador:
        session.delete(trabajador)
    
    empresa = session.exec(select(DatosEmpresaPrueba).where(DatosEmpresaPrueba.prueba_id == prueba_id)).first()
    if empresa:
        session.delete(empresa)
    
    # Finalmente eliminar la prueba principal
    session.delete(prueba)
    session.commit()
    
    return None
# ===== CREAR NUEVA PRUEBA (MONOLÍTICA) =====
@router.post("/", response_model=PruebaTrabajoResponse, status_code=status.HTTP_201_CREATED)
def crear_prueba_trabajo(
    prueba_data: PruebaTrabajoCreate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Crea una nueva prueba de trabajo completa"""
    
    # 1. Crear prueba principal
    prueba = PruebaTrabajo(
        estado=EstadoPrueba.BORRADOR,
        creado_por=current_user.id,
        fecha_creacion=datetime.utcnow(),
        fecha_actualizacion=datetime.utcnow()
    )
    if prueba_data.fecha_valoracion:
        pass # La fecha de valoración no está en el modelo principal, quizás debamos agregarla o usar fecha_creacion
             # Por ahora, usamos fecha_creacion
    
    session.add(prueba)
    session.commit()
    session.refresh(prueba)
    
    # 2. Crear datos empresa
    if prueba_data.datos_empresa:
        empresa = DatosEmpresaPrueba(
            prueba_id=prueba.id,
            **prueba_data.datos_empresa.model_dump()
        )
        session.add(empresa)
        
    # 3. Crear trabajador
    if prueba_data.trabajador:
        trabajador = TrabajadorPrueba(
            prueba_id=prueba.id,
            **prueba_data.trabajador.model_dump()
        )
        session.add(trabajador)
        
    # 4. Crear evaluador
    if prueba_data.evaluador:
        evaluador = DatosEvaluador(
            prueba_id=prueba.id,
            **prueba_data.evaluador.model_dump()
        )
        session.add(evaluador)
        
    # 5. Crear secciones
    if prueba_data.secciones:
        secciones = SeccionesPrueba(
            prueba_id=prueba.id,
            **prueba_data.secciones.model_dump()
        )
        session.add(secciones)
        
    # 6. Crear condiciones de riesgo
    if prueba_data.condiciones_riesgo:
        for cond_data in prueba_data.condiciones_riesgo:
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
            
            condicion = CondicionRiesgoPrueba(
                prueba_id=prueba.id,
                **cond_data.model_dump()
            )
            session.add(condicion)
            
    # 7. Crear resumen de factores
    if prueba_data.resumen_factores:
        for res_data in prueba_data.resumen_factores:
            resumen = ResumenFactorPrueba(
                prueba_id=prueba.id,
                **res_data.model_dump()
            )
            session.add(resumen)
            
    # 8. Crear concepto final
    if prueba_data.concepto_final:
        concepto = ConceptoFinalPrueba(
            prueba_id=prueba.id,
            **prueba_data.concepto_final.model_dump()
        )
        session.add(concepto)
        
    session.commit()
    session.refresh(prueba)
    
    return obtener_prueba(prueba.id, session, current_user)


# ===== ACTUALIZAR PRUEBA (MONOLÍTICA) =====
@router.put("/{prueba_id:int}", response_model=PruebaTrabajoResponse)
def actualizar_prueba(
    prueba_id: int,
    prueba_data: PruebaTrabajoUpdate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualiza una prueba de trabajo existente"""
    
    prueba = session.get(PruebaTrabajo, prueba_id)
    if not prueba:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prueba no encontrada"
        )
        
    # Verificar permisos
    if current_user.rol == "psicologo" and prueba.creado_por != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permiso para editar esta prueba"
        )
        
    # Actualizar campos básicos
    if prueba_data.estado:
        prueba.estado = prueba_data.estado
        
    prueba.fecha_actualizacion = datetime.utcnow()
    session.add(prueba)
    
    # 1. Actualizar empresa
    if prueba_data.datos_empresa:
        empresa = session.exec(select(DatosEmpresaPrueba).where(DatosEmpresaPrueba.prueba_id == prueba_id)).first()
        if empresa:
            for key, value in prueba_data.datos_empresa.model_dump().items():
                setattr(empresa, key, value)
            empresa.updated_at = datetime.utcnow()
            session.add(empresa)
        else:
            empresa = DatosEmpresaPrueba(prueba_id=prueba_id, **prueba_data.datos_empresa.model_dump())
            session.add(empresa)

    # 2. Actualizar trabajador
    if prueba_data.trabajador:
        trabajador = session.exec(select(TrabajadorPrueba).where(TrabajadorPrueba.prueba_id == prueba_id)).first()
        if trabajador:
            for key, value in prueba_data.trabajador.model_dump().items():
                setattr(trabajador, key, value)
            trabajador.updated_at = datetime.utcnow()
            session.add(trabajador)
        else:
            trabajador = TrabajadorPrueba(prueba_id=prueba_id, **prueba_data.trabajador.model_dump())
            session.add(trabajador)

    # 3. Actualizar evaluador
    if prueba_data.evaluador:
        evaluador = session.exec(select(DatosEvaluador).where(DatosEvaluador.prueba_id == prueba_id)).first()
        if evaluador:
            for key, value in prueba_data.evaluador.model_dump().items():
                setattr(evaluador, key, value)
            evaluador.updated_at = datetime.utcnow()
            session.add(evaluador)
        else:
            evaluador = DatosEvaluador(prueba_id=prueba_id, **prueba_data.evaluador.model_dump())
            session.add(evaluador)

    # 4. Actualizar secciones
    if prueba_data.secciones:
        secciones = session.exec(select(SeccionesPrueba).where(SeccionesPrueba.prueba_id == prueba_id)).first()
        if secciones:
            for key, value in prueba_data.secciones.model_dump().items():
                setattr(secciones, key, value)
            secciones.updated_at = datetime.utcnow()
            session.add(secciones)
        else:
            secciones = SeccionesPrueba(prueba_id=prueba_id, **prueba_data.secciones.model_dump())
            session.add(secciones)

    # 5. Actualizar condiciones de riesgo (Reemplazo total)
    if prueba_data.condiciones_riesgo is not None:
        # Eliminar existentes
        existentes = session.exec(select(CondicionRiesgoPrueba).where(CondicionRiesgoPrueba.prueba_id == prueba_id)).all()
        for item in existentes:
            session.delete(item)
            
        # Crear nuevos
        for cond_data in prueba_data.condiciones_riesgo:
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
            
            condicion = CondicionRiesgoPrueba(prueba_id=prueba_id, **cond_data.model_dump())
            session.add(condicion)

    # 6. Actualizar resumen de factores (Reemplazo total)
    if prueba_data.resumen_factores is not None:
        # Eliminar existentes
        existentes = session.exec(select(ResumenFactorPrueba).where(ResumenFactorPrueba.prueba_id == prueba_id)).all()
        for item in existentes:
            session.delete(item)
            
        # Crear nuevos
        for res_data in prueba_data.resumen_factores:
            resumen = ResumenFactorPrueba(prueba_id=prueba_id, **res_data.model_dump())
            session.add(resumen)

    # 7. Actualizar concepto final
    if prueba_data.concepto_final:
        concepto = session.exec(select(ConceptoFinalPrueba).where(ConceptoFinalPrueba.prueba_id == prueba_id)).first()
        
        # Manejo de firma (Base64 -> Archivo)
        firma_path = None
        if prueba_data.concepto_final.firma_evaluador and prueba_data.concepto_final.firma_evaluador.startswith('data:image'):
            try:
                import base64
                import uuid
                import os
                
                # Crear directorio si no existe
                upload_dir = "static/uploads/signatures"
                os.makedirs(upload_dir, exist_ok=True)
                
                # Decodificar imagen
                header, encoded = prueba_data.concepto_final.firma_evaluador.split(",", 1)
                data = base64.b64decode(encoded)
                
                # Generar nombre único
                filename = f"signature_{prueba_id}_{uuid.uuid4().hex[:8]}.png"
                file_path = os.path.join(upload_dir, filename)
                
                # Guardar archivo
                with open(file_path, "wb") as f:
                    f.write(data)
                
                firma_path = file_path
                # Actualizar el campo en el objeto de datospara que se guarde el path
                prueba_data.concepto_final.firma_evaluador = firma_path
            except Exception as e:
                print(f"Error guardando firma: {e}")
                # En caso de error, mantenemos el valor original (que fallará en el PDF pero no rompe el flujo)

        if concepto:
            for key, value in prueba_data.concepto_final.model_dump().items():
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
            concepto = ConceptoFinalPrueba(prueba_id=prueba_id, **prueba_data.concepto_final.model_dump())
            session.add(concepto)

    session.commit()
    session.refresh(prueba)
    
    return obtener_prueba(prueba.id, session, current_user)


# ===== FINALIZAR PRUEBA Y GENERAR PDF =====
@router.post("/{prueba_id:int}/finalizar", response_model=FinalizarPruebaResponse)
def finalizar_prueba(
    prueba_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Finaliza la prueba y genera el PDF"""

    prueba = session.get(PruebaTrabajo, prueba_id)
    if not prueba:
        raise HTTPException(status_code=404, detail="Prueba no encontrada")

    if current_user.rol == "psicologo" and prueba.creado_por != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso")

    # If already completed, just regenerate the PDF
    regenerando = prueba.estado == EstadoPrueba.COMPLETADA

    # Cargar todas las relaciones necesarias para el PDF
    datos_empresa = session.exec(
        select(DatosEmpresaPrueba).where(DatosEmpresaPrueba.prueba_id == prueba_id)
    ).first()

    trabajador = session.exec(
        select(TrabajadorPrueba).where(TrabajadorPrueba.prueba_id == prueba_id)
    ).first()

    evaluador = session.exec(
        select(DatosEvaluador).where(DatosEvaluador.prueba_id == prueba_id)
    ).first()

    secciones = session.exec(
        select(SeccionesPrueba).where(SeccionesPrueba.prueba_id == prueba_id)
    ).first()

    condiciones = session.exec(
        select(CondicionRiesgoPrueba).where(CondicionRiesgoPrueba.prueba_id == prueba_id)
        .order_by(CondicionRiesgoPrueba.dimension, CondicionRiesgoPrueba.item_numero)
    ).all()

    resumen = session.exec(
        select(ResumenFactorPrueba).where(ResumenFactorPrueba.prueba_id == prueba_id)
        .order_by(ResumenFactorPrueba.dimension)
    ).all()

    concepto = session.exec(
        select(ConceptoFinalPrueba).where(ConceptoFinalPrueba.prueba_id == prueba_id)
    ).first()

    try:
        # Generar PDF
        pdf_path = generar_pdf_prueba_trabajo(
            prueba=prueba,
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
        prueba.estado = EstadoPrueba.COMPLETADA
        prueba.fecha_finalizacion = datetime.utcnow()
        prueba.fecha_actualizacion = datetime.utcnow()
        session.add(prueba)
        session.commit()
        session.refresh(prueba)

        return FinalizarPruebaResponse(
            message="Prueba finalizada exitosamente",
            prueba_id=prueba.id,
            pdf_url=pdf_url
        )

    except Exception as e:
        session.rollback()
        prueba.estado = EstadoPrueba.BORRADOR
        session.add(prueba)
        session.commit()
        raise HTTPException(
            status_code=500,
            detail=f"Error al finalizar prueba: {str(e)}"
        )


# ===== DESCARGAR PDF =====
@router.get("/{prueba_id:int}/descargar-pdf")
def descargar_pdf(
    prueba_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Descarga el PDF de una prueba completada"""

    prueba = session.get(PruebaTrabajo, prueba_id)
    if not prueba:
        raise HTTPException(status_code=404, detail="Prueba no encontrada")

    if current_user.rol == "psicologo" and prueba.creado_por != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso")

    if prueba.estado != EstadoPrueba.COMPLETADA:
        raise HTTPException(
            status_code=400,
            detail="La prueba debe estar completada para descargar el PDF"
        )

    # Cargar todas las relaciones
    datos_empresa = session.exec(
        select(DatosEmpresaPrueba).where(DatosEmpresaPrueba.prueba_id == prueba_id)
    ).first()

    trabajador = session.exec(
        select(TrabajadorPrueba).where(TrabajadorPrueba.prueba_id == prueba_id)
    ).first()

    evaluador = session.exec(
        select(DatosEvaluador).where(DatosEvaluador.prueba_id == prueba_id)
    ).first()

    secciones = session.exec(
        select(SeccionesPrueba).where(SeccionesPrueba.prueba_id == prueba_id)
    ).first()

    condiciones = session.exec(
        select(CondicionRiesgoPrueba).where(CondicionRiesgoPrueba.prueba_id == prueba_id)
        .order_by(CondicionRiesgoPrueba.dimension, CondicionRiesgoPrueba.item_numero)
    ).all()

    resumen = session.exec(
        select(ResumenFactorPrueba).where(ResumenFactorPrueba.prueba_id == prueba_id)
        .order_by(ResumenFactorPrueba.dimension)
    ).all()

    concepto = session.exec(
        select(ConceptoFinalPrueba).where(ConceptoFinalPrueba.prueba_id == prueba_id)
    ).first()

    try:
        # Generar PDF
        print(f"Iniciando generación de PDF para prueba {prueba_id}")
        print(f"  - Estado prueba: {prueba.estado}")
        print(f"  - Datos empresa: {datos_empresa is not None}")
        print(f"  - Trabajador: {trabajador is not None}")
        print(f"  - Evaluador: {evaluador is not None}")
        print(f"  - Secciones: {secciones is not None}")
        print(f"  - Condiciones: {len(condiciones)}")
        print(f"  - Resumen: {len(resumen)}")
        print(f"  - Concepto: {concepto is not None}")
        
        pdf_path = generar_pdf_prueba_trabajo(
            prueba=prueba,
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

class GenerarConceptoPruebaRequest(BaseModel):
    prueba_id: Optional[int] = None
    # Datos opcionales para generación sin guardar
    nombre_trabajador: Optional[str] = None
    condiciones_riesgo: Optional[List[CondicionRiesgoPruebaCreate]] = None

class ConceptoPruebaResponse(BaseModel):
    analisis: str
    recomendaciones: str
    concepto_completo: str
    resumen_riesgos: Dict

from app.services.ml_prueba_trabajo_generator import generar_concepto_prueba_trabajo
from app.models.evaluacion import EvaluacionRiesgo, CategoriaRiesgo, CalificacionRiesgo

@router.post("/generar-concepto", response_model=ConceptoPruebaResponse)
def generar_concepto_prueba(
    request: GenerarConceptoPruebaRequest,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Genera análisis y recomendaciones automáticas para una Prueba de Trabajo.
    Puede funcionar con un ID de prueba existente O con datos enviados directamente.
    """
    
    nombre_trabajador = "el trabajador"
    condiciones_input = []
    
    # ESTRATEGIA 1: Usar prueba existente
    if request.prueba_id:
        prueba = session.get(PruebaTrabajo, request.prueba_id)
        if not prueba:
            raise HTTPException(status_code=404, detail="Prueba no encontrada")

        if current_user.rol == "psicologo" and prueba.creado_por != current_user.id:
            raise HTTPException(status_code=403, detail="Sin permiso")
            
        # Obtener datos de DB
        trabajador = session.exec(select(TrabajadorPrueba).where(TrabajadorPrueba.prueba_id == request.prueba_id)).first()
        nombre_trabajador = trabajador.nombre_completo if trabajador else "el trabajador"
        
        condiciones_db = session.exec(select(CondicionRiesgoPrueba).where(CondicionRiesgoPrueba.prueba_id == request.prueba_id)).all()
        
        # Convertir a formato común (usamos la estructura de CondicionRiesgoPruebaCreate/DB como base)
        condiciones_input = condiciones_db
        
    # ESTRATEGIA 2: Usar datos enviados (Direct Generation without Save)
    elif request.condiciones_riesgo:
        nombre_trabajador = request.nombre_trabajador or "el trabajador"
        condiciones_input = request.condiciones_riesgo
        
    else:
        raise HTTPException(status_code=400, detail="Debe proporcionar prueba_id o condiciones_riesgo")

    if not condiciones_input:
        # Retornar vacío amigable en lugar de error si no hay riesgos marcados
        return ConceptoPruebaResponse(
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
                # cond is Pydantic model (CondicionRiesgoPruebaCreate)
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
        resultado = generar_concepto_prueba_trabajo(
            evaluaciones=evaluaciones_adaptadas,
            nombre_trabajador=nombre_trabajador,
            tiene_diagnostico_mental=False 
        )
        
        # 6. Obtener resumen cuantitativo
        from app.services.ml_concepto_generator import analizar_perfil_ml
        perfil = analizar_perfil_ml(evaluaciones_adaptadas)
        
        return ConceptoPruebaResponse(
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
