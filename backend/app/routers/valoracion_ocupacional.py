"""
Router para el módulo de Valoración Ocupacional (Formatos TO)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlmodel import Session, select, func
from typing import Optional
from datetime import datetime
import os

from app.database.connection import get_session
from app.models.usuario import Usuario
from app.models.valoracion_ocupacional import (
    ValoracionOcupacional,
    SeccionesTextoVO, IdentificacionVO, EventoNoLaboralVO,
    HistoriaOcupacionalVO, ActividadActualVO, RolLaboralVO,
    EventoATELVO, ComposicionFamiliarVO, MiembroFamiliarVO,
    RegistroVO, EstadoValoracion
)
from app.schemas.valoracion_ocupacional import (
    ValoracionOcupacionalCreate, ValoracionOcupacionalUpdate,
    ValoracionOcupacionalResponse, ValoracionOcupacionalListItem,
    PaginatedValoracionesOcupacionalesResponse
)
from app.services.auth import get_current_user
from app.services.pdf_generator_valoracion_ocupacional import generar_pdf_valoracion_ocupacional

router = APIRouter(
    prefix="/formatos-to/valoracion-ocupacional",
    tags=["Formatos TO - Valoración Ocupacional"]
)


# ── Helper: construir response completo ──────────────────────────────
def _build_response(valoracion: ValoracionOcupacional, session: Session) -> ValoracionOcupacionalResponse:
    vid = valoracion.id

    secciones_texto = session.exec(select(SeccionesTextoVO).where(SeccionesTextoVO.valoracion_id == vid)).first()
    identificacion = session.exec(select(IdentificacionVO).where(IdentificacionVO.valoracion_id == vid)).first()
    eventos_no_laborales = session.exec(select(EventoNoLaboralVO).where(EventoNoLaboralVO.valoracion_id == vid).order_by(EventoNoLaboralVO.orden)).all()
    historia_ocupacional = session.exec(select(HistoriaOcupacionalVO).where(HistoriaOcupacionalVO.valoracion_id == vid).order_by(HistoriaOcupacionalVO.orden)).all()
    actividad_actual = session.exec(select(ActividadActualVO).where(ActividadActualVO.valoracion_id == vid)).first()
    rol_laboral = session.exec(select(RolLaboralVO).where(RolLaboralVO.valoracion_id == vid)).first()
    evento_atel = session.exec(select(EventoATELVO).where(EventoATELVO.valoracion_id == vid)).first()
    composicion_familiar = session.exec(select(ComposicionFamiliarVO).where(ComposicionFamiliarVO.valoracion_id == vid)).first()
    miembros_familiares = session.exec(select(MiembroFamiliarVO).where(MiembroFamiliarVO.valoracion_id == vid).order_by(MiembroFamiliarVO.orden)).all()
    registro = session.exec(select(RegistroVO).where(RegistroVO.valoracion_id == vid)).first()

    return ValoracionOcupacionalResponse(
        id=valoracion.id,
        estado=valoracion.estado,
        creado_por=valoracion.creado_por,
        fecha_creacion=valoracion.fecha_creacion,
        fecha_actualizacion=valoracion.fecha_actualizacion,
        fecha_finalizacion=valoracion.fecha_finalizacion,
        secciones_texto=secciones_texto,
        identificacion=identificacion,
        eventos_no_laborales=list(eventos_no_laborales) if eventos_no_laborales else [],
        historia_ocupacional=list(historia_ocupacional) if historia_ocupacional else [],
        actividad_actual=actividad_actual,
        rol_laboral=rol_laboral,
        evento_atel=evento_atel,
        composicion_familiar=composicion_familiar,
        miembros_familiares=list(miembros_familiares) if miembros_familiares else [],
        registro=registro,
    )


# ── Helper: verificar permisos ───────────────────────────────────────
def _check_permission(valoracion: ValoracionOcupacional, user: Usuario):
    if user.rol in ("admin", "supervisor"):
        return
    if valoracion.creado_por != user.id:
        raise HTTPException(status_code=403, detail="Sin permiso para esta valoración")


# ═════════════════════════════════════════════════════════════════════
# LISTAR
# ═════════════════════════════════════════════════════════════════════
@router.get("/", response_model=PaginatedValoracionesOcupacionalesResponse)
def listar_valoraciones(
    skip: int = 0,
    limit: int = 10,
    estado: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol == "admin":
        base = select(ValoracionOcupacional)
    else:
        base = select(ValoracionOcupacional).where(ValoracionOcupacional.creado_por == current_user.id)

    if estado and estado != "todos":
        base = base.where(ValoracionOcupacional.estado == estado)

    total = session.exec(select(func.count()).select_from(base.subquery())).one()
    valoraciones = session.exec(base.offset(skip).limit(limit).order_by(ValoracionOcupacional.fecha_creacion.desc())).all()

    items = []
    for v in valoraciones:
        ident = session.exec(select(IdentificacionVO).where(IdentificacionVO.valoracion_id == v.id)).first()
        items.append(ValoracionOcupacionalListItem(
            id=v.id,
            estado=v.estado,
            fecha_creacion=v.fecha_creacion,
            fecha_actualizacion=v.fecha_actualizacion,
            trabajador_nombre=ident.nombre_trabajador if ident else None,
            trabajador_documento=ident.numero_documento if ident else None,
            empresa=ident.empresa if ident else None,
        ))

    return PaginatedValoracionesOcupacionalesResponse(items=items, total=total)


# ═════════════════════════════════════════════════════════════════════
# OBTENER POR ID
# ═════════════════════════════════════════════════════════════════════
@router.get("/{valoracion_id}", response_model=ValoracionOcupacionalResponse)
def obtener_valoracion(
    valoracion_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    valoracion = session.get(ValoracionOcupacional, valoracion_id)
    if not valoracion:
        raise HTTPException(404, "Valoración Ocupacional no encontrada")
    _check_permission(valoracion, current_user)
    return _build_response(valoracion, session)


# ═════════════════════════════════════════════════════════════════════
# CREAR
# ═════════════════════════════════════════════════════════════════════
@router.post("/", response_model=ValoracionOcupacionalResponse, status_code=201)
def crear_valoracion(
    data: ValoracionOcupacionalCreate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    valoracion = ValoracionOcupacional(
        estado=EstadoValoracion.BORRADOR,
        creado_por=current_user.id,
        fecha_creacion=datetime.utcnow(),
        fecha_actualizacion=datetime.utcnow(),
    )
    session.add(valoracion)
    session.commit()
    session.refresh(valoracion)

    _save_children(valoracion.id, data, session)
    session.commit()
    session.refresh(valoracion)

    return _build_response(valoracion, session)


# ═════════════════════════════════════════════════════════════════════
# ACTUALIZAR
# ═════════════════════════════════════════════════════════════════════
@router.put("/{valoracion_id}", response_model=ValoracionOcupacionalResponse)
def actualizar_valoracion(
    valoracion_id: int,
    data: ValoracionOcupacionalUpdate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    valoracion = session.get(ValoracionOcupacional, valoracion_id)
    if not valoracion:
        raise HTTPException(404, "Valoración Ocupacional no encontrada")
    _check_permission(valoracion, current_user)

    if data.estado:
        valoracion.estado = data.estado
    valoracion.fecha_actualizacion = datetime.utcnow()
    session.add(valoracion)

    # Borrar hijos existentes y recrear
    _delete_children(valoracion_id, session)
    _save_children(valoracion_id, data, session)

    session.commit()
    session.refresh(valoracion)
    return _build_response(valoracion, session)


# ═════════════════════════════════════════════════════════════════════
# ELIMINAR
# ═════════════════════════════════════════════════════════════════════
@router.delete("/{valoracion_id}", status_code=204)
def eliminar_valoracion(
    valoracion_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    valoracion = session.get(ValoracionOcupacional, valoracion_id)
    if not valoracion:
        raise HTTPException(404, "Valoración no encontrada")
    _check_permission(valoracion, current_user)

    _delete_children(valoracion_id, session)
    session.delete(valoracion)
    session.commit()
    return None


# ═════════════════════════════════════════════════════════════════════
# HELPERS INTERNOS
# ═════════════════════════════════════════════════════════════════════

def _save_children(vid: int, data, session: Session):
    """Guarda todas las relaciones hijas de una valoración."""
    if data.secciones_texto:
        session.add(SeccionesTextoVO(valoracion_id=vid, **data.secciones_texto.model_dump()))

    if data.identificacion:
        session.add(IdentificacionVO(valoracion_id=vid, **data.identificacion.model_dump()))

    if data.eventos_no_laborales:
        for i, ev in enumerate(data.eventos_no_laborales):
            d = ev.model_dump()
            d["orden"] = i
            session.add(EventoNoLaboralVO(valoracion_id=vid, **d))

    if data.historia_ocupacional:
        for i, hist in enumerate(data.historia_ocupacional):
            d = hist.model_dump()
            d["orden"] = i
            session.add(HistoriaOcupacionalVO(valoracion_id=vid, **d))

    if data.actividad_actual:
        session.add(ActividadActualVO(valoracion_id=vid, **data.actividad_actual.model_dump()))

    if data.rol_laboral:
        session.add(RolLaboralVO(valoracion_id=vid, **data.rol_laboral.model_dump()))

    if data.evento_atel:
        session.add(EventoATELVO(valoracion_id=vid, **data.evento_atel.model_dump()))

    if data.composicion_familiar:
        session.add(ComposicionFamiliarVO(valoracion_id=vid, **data.composicion_familiar.model_dump()))

    if data.miembros_familiares:
        for i, miem in enumerate(data.miembros_familiares):
            d = miem.model_dump()
            d["orden"] = i
            session.add(MiembroFamiliarVO(valoracion_id=vid, **d))

    if data.registro:
        session.add(RegistroVO(valoracion_id=vid, **data.registro.model_dump()))


def _delete_children(vid: int, session: Session):
    """Elimina todas las relaciones hijas de una valoración."""
    for Model in [
        RegistroVO, MiembroFamiliarVO, ComposicionFamiliarVO,
        EventoATELVO, RolLaboralVO, ActividadActualVO,
        HistoriaOcupacionalVO, EventoNoLaboralVO,
        IdentificacionVO, SeccionesTextoVO
    ]:
        items = session.exec(select(Model).where(Model.valoracion_id == vid)).all()
        for item in items:
            session.delete(item)


# ═════════════════════════════════════════════════════════════════════
# DESCARGAR PDF
# ═════════════════════════════════════════════════════════════════════
@router.get("/{valoracion_id}/descargar-pdf")
def descargar_pdf(
    valoracion_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Descarga el PDF de una valoración ocupacional"""
    valoracion = session.get(ValoracionOcupacional, valoracion_id)
    if not valoracion:
        raise HTTPException(status_code=404, detail="Valoración Ocupacional no encontrada")

    if current_user.rol not in ("admin", "supervisor") and valoracion.creado_por != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso")

    # Obtener relaciones
    secciones_texto = session.exec(select(SeccionesTextoVO).where(SeccionesTextoVO.valoracion_id == valoracion_id)).first()
    identificacion = session.exec(select(IdentificacionVO).where(IdentificacionVO.valoracion_id == valoracion_id)).first()
    eventos_no_laborales = session.exec(select(EventoNoLaboralVO).where(EventoNoLaboralVO.valoracion_id == valoracion_id).order_by(EventoNoLaboralVO.orden)).all()
    historia_ocupacional = session.exec(select(HistoriaOcupacionalVO).where(HistoriaOcupacionalVO.valoracion_id == valoracion_id).order_by(HistoriaOcupacionalVO.orden)).all()
    actividad_actual = session.exec(select(ActividadActualVO).where(ActividadActualVO.valoracion_id == valoracion_id)).first()
    rol_laboral = session.exec(select(RolLaboralVO).where(RolLaboralVO.valoracion_id == valoracion_id)).first()
    evento_atel = session.exec(select(EventoATELVO).where(EventoATELVO.valoracion_id == valoracion_id)).first()
    composicion_familiar = session.exec(select(ComposicionFamiliarVO).where(ComposicionFamiliarVO.valoracion_id == valoracion_id)).first()
    miembros_familiares = session.exec(select(MiembroFamiliarVO).where(MiembroFamiliarVO.valoracion_id == valoracion_id).order_by(MiembroFamiliarVO.orden)).all()
    registro = session.exec(select(RegistroVO).where(RegistroVO.valoracion_id == valoracion_id)).first()

    # Usuario evaluador
    evaluador = session.get(Usuario, valoracion.creado_por)

    try:
        pdf_path = generar_pdf_valoracion_ocupacional(
            valoracion=valoracion,
            identificacion=identificacion,
            secciones_texto=secciones_texto,
            historia_ocupacional=list(historia_ocupacional),
            eventos_no_laborales=list(eventos_no_laborales),
            actividad_actual=actividad_actual,
            rol_laboral=rol_laboral,
            evento_atel=evento_atel,
            composicion_familiar=composicion_familiar,
            miembros_familiares=list(miembros_familiares),
            registro=registro,
            evaluador=evaluador,
            output_dir="pdfs"
        )

        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="El archivo PDF no se generó correctamente")

        return FileResponse(
            path=pdf_path,
            filename=os.path.basename(pdf_path),
            media_type="application/pdf"
        )
    except Exception as e:
        print(f"Error generando PDF: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar el PDF: {str(e)}"
        )
