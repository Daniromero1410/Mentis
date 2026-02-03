from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from app.database.connection import get_session
from app.models.usuario import Usuario
from app.models.valoracion import Valoracion, Trabajador, InfoLaboral, HistoriaOcupacional, ActividadLaboral
from app.models.evaluacion import EvaluacionRiesgo
from app.models.concepto import ConceptoFinal
from app.services.auth import get_current_user
from app.services.excel_generator import generar_excel_valoracion, generar_plantilla_vacia

router = APIRouter(prefix="/reportes", tags=["Reportes"])


@router.get("/excel/{valoracion_id}")
def descargar_excel_valoracion(
    valoracion_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Descarga la valoración en formato Excel"""
    
    # Obtener valoración
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
            detail="No tiene permiso para esta valoración"
        )
    
    # Obtener datos relacionados
    trabajador = session.exec(
        select(Trabajador).where(Trabajador.valoracion_id == valoracion_id)
    ).first()
    
    if not trabajador:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La valoración no tiene trabajador asociado"
        )
    
    info_laboral = session.exec(
        select(InfoLaboral).where(InfoLaboral.valoracion_id == valoracion_id)
    ).first()
    
    historia = session.exec(
        select(HistoriaOcupacional)
        .where(HistoriaOcupacional.valoracion_id == valoracion_id)
        .order_by(HistoriaOcupacional.orden)
    ).all()
    
    actividad = session.exec(
        select(ActividadLaboral).where(ActividadLaboral.valoracion_id == valoracion_id)
    ).first()
    
    evaluaciones = session.exec(
        select(EvaluacionRiesgo)
        .where(EvaluacionRiesgo.valoracion_id == valoracion_id)
        .order_by(EvaluacionRiesgo.categoria, EvaluacionRiesgo.item_numero)
    ).all()
    
    concepto = session.exec(
        select(ConceptoFinal).where(ConceptoFinal.valoracion_id == valoracion_id)
    ).first()
    
    # Generar Excel
    excel_file = generar_excel_valoracion(
        valoracion=valoracion,
        trabajador=trabajador,
        info_laboral=info_laboral,
        historia_ocupacional=historia,
        actividad_laboral=actividad,
        evaluaciones=evaluaciones,
        concepto=concepto
    )
    
    # Nombre del archivo
    nombre_archivo = f"valoracion_{trabajador.documento}_{valoracion.fecha_valoracion}.xlsx"
    
    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={nombre_archivo}"}
    )


@router.get("/plantilla")
def descargar_plantilla_excel(
    current_user: Usuario = Depends(get_current_user)
):
    """Descarga la plantilla Excel vacía para llenar manualmente"""
    
    excel_file = generar_plantilla_vacia()
    
    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=plantilla_valoracion_psicologica.xlsx"}
    )


@router.get("/plantilla-prueba-trabajo")
def descargar_plantilla_prueba_trabajo(
    current_user: Usuario = Depends(get_current_user)
):
    """Descarga la plantilla Excel de Prueba de Trabajo de Esfera Mental"""
    from pathlib import Path
    from fastapi.responses import FileResponse
    
    # Usar el directorio de trabajo actual (donde se ejecuta uvicorn)
    plantilla_path = Path("static/plantillas/plantilla_prueba_trabajo.xlsx")
    
    if not plantilla_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plantilla no encontrada en {plantilla_path.resolve()}"
        )
    
    return FileResponse(
        path=str(plantilla_path),
        filename="Plantilla_Prueba_Trabajo_Esfera_Mental.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )