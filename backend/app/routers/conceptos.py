from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Dict, Optional, List
from app.database.connection import get_session
from app.models.usuario import Usuario
from app.models.valoracion import Valoracion, Trabajador
from app.models.evaluacion import EvaluacionRiesgo, CategoriaRiesgo, CalificacionRiesgo
from app.models.concepto import ConceptoFinal
from app.services.auth import get_current_user
from app.services.ml_concepto_generator import generar_concepto_ml, analizar_perfil_ml

router = APIRouter(prefix="/conceptos", tags=["Conceptos"])

class ConceptoGeneradoResponse(BaseModel):
    concepto: str
    resumen_riesgos: Dict

class EvaluacionRiesgoInput(BaseModel):
    categoria: str
    item_numero: int
    calificacion: str
    observaciones: Optional[str] = None

class GenerarConceptoRequest(BaseModel):
    valoracion_id: Optional[int] = None
    evaluaciones: Optional[List[EvaluacionRiesgoInput]] = None
    nombre_trabajador: Optional[str] = None
    tiene_diagnostico_mental: Optional[bool] = False

@router.post("/generar", response_model=ConceptoGeneradoResponse)
def generar_concepto_endpoint(
    request: GenerarConceptoRequest,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Genera el concepto psicológico automáticamente basado en las evaluaciones"""

    # Si vienen evaluaciones en el request, usarlas directamente (modo formulario)
    if request.evaluaciones and len(request.evaluaciones) > 0:
        # Crear objetos EvaluacionRiesgo temporales a partir del input
        evaluaciones = []
        for eval_input in request.evaluaciones:
            eval_obj = EvaluacionRiesgo(
                categoria=CategoriaRiesgo(eval_input.categoria),
                item_numero=eval_input.item_numero,
                calificacion=CalificacionRiesgo(eval_input.calificacion),
                observaciones=eval_input.observaciones
            )
            evaluaciones.append(eval_obj)

        nombre_trabajador = request.nombre_trabajador or "el afiliado"
        tiene_diagnostico = request.tiene_diagnostico_mental or False

    else:
        # Modo tradicional: buscar en la base de datos
        if not request.valoracion_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe proporcionar valoracion_id o evaluaciones"
            )

        # Obtener valoración
        valoracion = session.get(Valoracion, request.valoracion_id)
        if not valoracion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Valoración no encontrada"
            )

        # Verificar permisos
        if current_user.rol == "psicologo" and valoracion.creado_por != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permiso para esta valoración"
            )

        # Obtener trabajador
        trab_query = select(Trabajador).where(Trabajador.valoracion_id == request.valoracion_id)
        trabajador = session.exec(trab_query).first()

        if not trabajador:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La valoración no tiene trabajador asociado"
            )

        # Obtener evaluaciones
        eval_query = select(EvaluacionRiesgo).where(
            EvaluacionRiesgo.valoracion_id == request.valoracion_id
        )
        evaluaciones = list(session.exec(eval_query).all())

        if not evaluaciones:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La valoración no tiene evaluaciones de riesgo"
            )

        nombre_trabajador = trabajador.nombre
        tiene_diagnostico = bool(trabajador.diagnostico_mental and trabajador.diagnostico_mental.strip())

    # Generar concepto con ML (Machine Learning avanzado)
    concepto_texto = generar_concepto_ml(
        evaluaciones=evaluaciones,
        nombre_trabajador=nombre_trabajador,
        tiene_diagnostico_mental=tiene_diagnostico
    )

    # Obtener análisis cuantitativo ML
    perfil = analizar_perfil_ml(evaluaciones)
    resumen = {
        'nivel_global': perfil['severidad_global'],
        'score_global': round(perfil['score_global'], 2),
        'categorias_criticas': perfil['categorias_criticas'],
        'categorias_altas': perfil['categorias_altas'],
        'categorias_medias': perfil['categorias_medias'],
        'scores_por_categoria': {
            cat: {
                'score': round(info['score'], 2),
                'nivel': info['nivel'],
                'porcentajes': info['porcentajes']
            }
            for cat, info in perfil['scores_categorias'].items()
        }
    }

    # Si hay valoracion_id, guardar o actualizar concepto en la base de datos
    if request.valoracion_id:
        conc_query = select(ConceptoFinal).where(ConceptoFinal.valoracion_id == request.valoracion_id)
        concepto_db = session.exec(conc_query).first()

        if concepto_db:
            concepto_db.concepto_generado = concepto_texto
        else:
            concepto_db = ConceptoFinal(
                valoracion_id=request.valoracion_id,
                concepto_generado=concepto_texto
            )
            session.add(concepto_db)

        session.commit()

    return ConceptoGeneradoResponse(
        concepto=concepto_texto,
        resumen_riesgos=resumen
    )

@router.get("/resumen/{valoracion_id}", response_model=Dict)
def obtener_resumen_endpoint(
    valoracion_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene el resumen de niveles de riesgo de una valoración"""

    # Obtener evaluaciones
    eval_query = select(EvaluacionRiesgo).where(
        EvaluacionRiesgo.valoracion_id == valoracion_id
    )
    evaluaciones = session.exec(eval_query).all()

    if not evaluaciones:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron evaluaciones para esta valoración"
        )

    # Analizar con ML
    perfil = analizar_perfil_ml(list(evaluaciones))

    return {
        'nivel_global': perfil['severidad_global'],
        'score_global': round(perfil['score_global'], 2),
        'categorias_criticas': perfil['categorias_criticas'],
        'categorias_altas': perfil['categorias_altas'],
        'categorias_medias': perfil['categorias_medias'],
        'scores_por_categoria': {
            cat: {
                'score': round(info['score'], 2),
                'nivel': info['nivel'],
                'porcentajes': info['porcentajes']
            }
            for cat, info in perfil['scores_categorias'].items()
        }
    }