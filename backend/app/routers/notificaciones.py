"""
Router de notificaciones del usuario actual.
"""
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from typing import List

from app.database.connection import get_session
from app.models.usuario import Usuario
from app.models.cuenta import Notificacion
from app.schemas.cuenta import NotificacionRead
from app.services.auth import get_current_user

router = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])


@router.get("/", response_model=List[NotificacionRead])
def mis_notificaciones(
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    notis = session.exec(
        select(Notificacion)
        .where(Notificacion.usuario_destino_id == current_user.id)
        .order_by(Notificacion.created_at.desc())
        .limit(50)
    ).all()
    return list(notis)


@router.get("/no-leidas-count")
def conteo_no_leidas(
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    count = session.exec(
        select(func.count()).select_from(Notificacion).where(
            Notificacion.usuario_destino_id == current_user.id,
            Notificacion.leida == False,  # noqa: E712
        )
    ).one()
    return {"no_leidas": count}


@router.put("/{noti_id}/leer")
def marcar_leida(
    noti_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    noti = session.get(Notificacion, noti_id)
    if not noti or noti.usuario_destino_id != current_user.id:
        return {"ok": False}
    noti.leida = True
    session.add(noti)
    session.commit()
    return {"ok": True}


@router.put("/leer-todas")
def marcar_todas_leidas(
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    notis = session.exec(
        select(Notificacion).where(
            Notificacion.usuario_destino_id == current_user.id,
            Notificacion.leida == False,  # noqa: E712
        )
    ).all()
    for n in notis:
        n.leida = True
        session.add(n)
    session.commit()
    return {"ok": True, "actualizadas": len(notis)}
