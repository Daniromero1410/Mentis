"""
Router para el módulo de Análisis de Exigencia (Terapia Ocupacional)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from typing import Optional
from datetime import datetime

from app.database.connection import get_session
from app.models.usuario import Usuario
from app.models.analisis_exigencia import (
    AnalisisExigencia, IdentificacionAE, SeccionesTextoAE,
    DesempenoOrgAE, TareaAE, MaterialEquipoAE,
    PeligroProcesoAE, RecomendacionesAE, RegistroAE,
    PerfilExigenciasAE, EstadoAnalisisExigencia
)
from app.schemas.analisis_exigencia import (
    AnalisisExigenciaCreate, AnalisisExigenciaUpdate,
    AnalisisExigenciaResponse, AnalisisExigenciaListItem,
    AnalisisExigenciaListResponse
)
from app.services.auth import get_current_user

router = APIRouter(
    prefix="/formatos-to/analisis-exigencia",
    tags=["Formatos TO - Análisis de Exigencia"]
)


# ── Helper: construir response completo ──────────────────────────────
def _build_response(analisis: AnalisisExigencia, session: Session) -> AnalisisExigenciaResponse:
    pid = analisis.id

    identificacion = session.exec(select(IdentificacionAE).where(IdentificacionAE.prueba_id == pid)).first()
    secciones = session.exec(select(SeccionesTextoAE).where(SeccionesTextoAE.prueba_id == pid)).first()
    desempeno = session.exec(select(DesempenoOrgAE).where(DesempenoOrgAE.prueba_id == pid)).first()
    tareas = session.exec(select(TareaAE).where(TareaAE.prueba_id == pid).order_by(TareaAE.orden)).all()
    materiales = session.exec(select(MaterialEquipoAE).where(MaterialEquipoAE.prueba_id == pid).order_by(MaterialEquipoAE.orden)).all()
    peligros = session.exec(select(PeligroProcesoAE).where(PeligroProcesoAE.prueba_id == pid)).all()
    recomendaciones = session.exec(select(RecomendacionesAE).where(RecomendacionesAE.prueba_id == pid)).first()
    registro = session.exec(select(RegistroAE).where(RegistroAE.prueba_id == pid)).first()
    perfil_exigencias = session.exec(select(PerfilExigenciasAE).where(PerfilExigenciasAE.prueba_id == pid)).first()

    return AnalisisExigenciaResponse(
        id=analisis.id,
        estado=analisis.estado,
        creado_por=analisis.creado_por,
        fecha_creacion=analisis.fecha_creacion,
        fecha_actualizacion=analisis.fecha_actualizacion,
        fecha_finalizacion=analisis.fecha_finalizacion,
        identificacion=identificacion,
        secciones_texto=secciones,
        desempeno_organizacional=desempeno,
        tareas=list(tareas) if tareas else [],
        materiales_equipos=list(materiales) if materiales else [],
        peligros=list(peligros) if peligros else [],
        recomendaciones=recomendaciones,
        perfil_exigencias=perfil_exigencias,
        registro=registro,
    )


# ── Helper: verificar permisos ───────────────────────────────────────
def _check_permission(analisis: AnalisisExigencia, user: Usuario):
    if user.rol in ("admin", "supervisor"):
        return
    if analisis.creado_por != user.id:
        raise HTTPException(status_code=403, detail="Sin permiso para este análisis")


# ═════════════════════════════════════════════════════════════════════
# LISTAR
# ═════════════════════════════════════════════════════════════════════
@router.get("/", response_model=AnalisisExigenciaListResponse)
def listar_analisis(
    skip: int = 0,
    limit: int = 10,
    estado: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol == "admin":
        base = select(AnalisisExigencia)
    else:
        base = select(AnalisisExigencia).where(AnalisisExigencia.creado_por == current_user.id)

    if estado and estado != "todos":
        base = base.where(AnalisisExigencia.estado == estado)

    total = session.exec(select(func.count()).select_from(base.subquery())).one()
    analisis_list = session.exec(base.offset(skip).limit(limit).order_by(AnalisisExigencia.fecha_creacion.desc())).all()

    items = []
    for a in analisis_list:
        ident = session.exec(select(IdentificacionAE).where(IdentificacionAE.prueba_id == a.id)).first()
        items.append(AnalisisExigenciaListItem(
            id=a.id,
            estado=a.estado,
            fecha_creacion=a.fecha_creacion,
            fecha_actualizacion=a.fecha_actualizacion,
            trabajador_nombre=ident.nombre_trabajador if ident else None,
            trabajador_tipo_documento=ident.tipo_documento if ident else None,
            trabajador_documento=ident.numero_documento if ident else None,
            empresa=ident.empresa if ident else None,
        ))

    return AnalisisExigenciaListResponse(items=items, total=total)


# ═════════════════════════════════════════════════════════════════════
# OBTENER POR ID
# ═════════════════════════════════════════════════════════════════════
@router.get("/{analisis_id}", response_model=AnalisisExigenciaResponse)
def obtener_analisis(
    analisis_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    analisis = session.get(AnalisisExigencia, analisis_id)
    if not analisis:
        raise HTTPException(404, "Análisis no encontrado")
    _check_permission(analisis, current_user)
    return _build_response(analisis, session)


# ═════════════════════════════════════════════════════════════════════
# CREAR
# ═════════════════════════════════════════════════════════════════════
@router.post("/", response_model=AnalisisExigenciaResponse, status_code=201)
def crear_analisis(
    data: AnalisisExigenciaCreate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    analisis = AnalisisExigencia(
        estado=data.estado if data.estado else EstadoAnalisisExigencia.BORRADOR,
        creado_por=current_user.id,
        fecha_creacion=datetime.utcnow(),
        fecha_actualizacion=datetime.utcnow(),
    )
    session.add(analisis)
    session.commit()
    session.refresh(analisis)

    _save_children(analisis.id, data, session)
    session.commit()
    session.refresh(analisis)

    return _build_response(analisis, session)


# ═════════════════════════════════════════════════════════════════════
# ACTUALIZAR
# ═════════════════════════════════════════════════════════════════════
@router.put("/{analisis_id}", response_model=AnalisisExigenciaResponse)
def actualizar_analisis(
    analisis_id: int,
    data: AnalisisExigenciaUpdate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    analisis = session.get(AnalisisExigencia, analisis_id)
    if not analisis:
        raise HTTPException(404, "Análisis no encontrado")
    _check_permission(analisis, current_user)

    analisis.fecha_actualizacion = datetime.utcnow()
    if data.estado:
        analisis.estado = data.estado
    session.add(analisis)

    # Borrar hijos existentes y recrear
    _delete_children(analisis_id, session)
    _save_children(analisis_id, data, session)

    session.commit()
    session.refresh(analisis)
    return _build_response(analisis, session)


# ═════════════════════════════════════════════════════════════════════
# ELIMINAR
# ═════════════════════════════════════════════════════════════════════
@router.delete("/{analisis_id}", status_code=204)
def eliminar_analisis(
    analisis_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    analisis = session.get(AnalisisExigencia, analisis_id)
    if not analisis:
        raise HTTPException(404, "Análisis no encontrado")
    _check_permission(analisis, current_user)

    _delete_children(analisis_id, session)
    session.flush() # Force delete children first
    session.delete(analisis)
    session.commit()
    return None


# ═════════════════════════════════════════════════════════════════════
# HELPERS INTERNOS
# ═════════════════════════════════════════════════════════════════════

def _save_children(prueba_id: int, data, session: Session):
    """Guarda todas las relaciones hijas de un análisis."""
    if data.identificacion:
        session.add(IdentificacionAE(prueba_id=prueba_id, **data.identificacion.model_dump()))

    if data.secciones_texto:
        session.add(SeccionesTextoAE(prueba_id=prueba_id, **data.secciones_texto.model_dump()))

    if data.desempeno_organizacional:
        session.add(DesempenoOrgAE(prueba_id=prueba_id, **data.desempeno_organizacional.model_dump()))

    if data.tareas:
        for i, t in enumerate(data.tareas):
            d = t.model_dump()
            d["orden"] = i
            session.add(TareaAE(prueba_id=prueba_id, **d))

    if data.materiales_equipos:
        for i, m in enumerate(data.materiales_equipos):
            d = m.model_dump()
            d["orden"] = i
            session.add(MaterialEquipoAE(prueba_id=prueba_id, **d))

    if data.peligros:
        for p in data.peligros:
            session.add(PeligroProcesoAE(prueba_id=prueba_id, **p.model_dump()))

    if data.recomendaciones:
        session.add(RecomendacionesAE(prueba_id=prueba_id, **data.recomendaciones.model_dump()))

    if data.registro:
        session.add(RegistroAE(prueba_id=prueba_id, **data.registro.model_dump()))

    if data.perfil_exigencias:
        # Convert pydantic model to dict if needed, but model_dump() handles it
        session.add(PerfilExigenciasAE(prueba_id=prueba_id, **data.perfil_exigencias.model_dump()))


def _delete_children(prueba_id: int, session: Session):
    """Elimina todas las relaciones hijas de un análisis."""
    for Model in [RegistroAE, RecomendacionesAE, PeligroProcesoAE,
                  MaterialEquipoAE, TareaAE, DesempenoOrgAE,
                  SeccionesTextoAE, IdentificacionAE, PerfilExigenciasAE]:
        items = session.exec(select(Model).where(Model.prueba_id == prueba_id)).all()
        for item in items:
            session.delete(item)
