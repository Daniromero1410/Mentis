"""
Router para el módulo de Pruebas de Trabajo TO (Terapia Ocupacional)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlmodel import Session, select, func
from typing import Optional
from datetime import datetime
from pathlib import Path

from app.database.connection import get_session
from app.models.usuario import Usuario
from app.models.prueba_trabajo_to import (
    PruebaTrabajoTO, IdentificacionTO, SeccionesTextoTO,
    DesempenoOrgTO, TareaTO, MaterialEquipoTO,
    PeligroProcesoTO, RecomendacionesTO, RegistroTO,
    EstadoPruebaTO
)
from app.schemas.prueba_trabajo_to import (
    PruebaTrabajoTOCreate, PruebaTrabajoTOUpdate,
    PruebaTrabajoTOResponse, PruebaTrabajoTOListItem,
    PaginatedPruebasTOResponse, FinalizarPruebaTOResponse
)
from app.services.auth import get_current_user

router = APIRouter(
    prefix="/formatos-to/pruebas-trabajo",
    tags=["Formatos TO - Pruebas de Trabajo"]
)


# ── Helper: construir response completo ──────────────────────────────
def _build_response(prueba: PruebaTrabajoTO, session: Session) -> PruebaTrabajoTOResponse:
    pid = prueba.id

    identificacion = session.exec(select(IdentificacionTO).where(IdentificacionTO.prueba_id == pid)).first()
    secciones = session.exec(select(SeccionesTextoTO).where(SeccionesTextoTO.prueba_id == pid)).first()
    desempeno = session.exec(select(DesempenoOrgTO).where(DesempenoOrgTO.prueba_id == pid)).first()
    tareas = session.exec(select(TareaTO).where(TareaTO.prueba_id == pid).order_by(TareaTO.orden)).all()
    materiales = session.exec(select(MaterialEquipoTO).where(MaterialEquipoTO.prueba_id == pid).order_by(MaterialEquipoTO.orden)).all()
    peligros = session.exec(select(PeligroProcesoTO).where(PeligroProcesoTO.prueba_id == pid)).all()
    recomendaciones = session.exec(select(RecomendacionesTO).where(RecomendacionesTO.prueba_id == pid)).first()
    registro = session.exec(select(RegistroTO).where(RegistroTO.prueba_id == pid)).first()

    return PruebaTrabajoTOResponse(
        id=prueba.id,
        estado=prueba.estado,
        creado_por=prueba.creado_por,
        fecha_creacion=prueba.fecha_creacion,
        fecha_actualizacion=prueba.fecha_actualizacion,
        fecha_finalizacion=prueba.fecha_finalizacion,
        identificacion=identificacion,
        secciones_texto=secciones,
        desempeno_organizacional=desempeno,
        tareas=list(tareas) if tareas else [],
        materiales_equipos=list(materiales) if materiales else [],
        peligros=list(peligros) if peligros else [],
        recomendaciones=recomendaciones,
        registro=registro,
    )


# ── Helper: verificar permisos ───────────────────────────────────────
def _check_permission(prueba: PruebaTrabajoTO, user: Usuario):
    if user.rol in ("admin", "supervisor"):
        return
    if prueba.creado_por != user.id:
        raise HTTPException(status_code=403, detail="Sin permiso para esta prueba")


# ═════════════════════════════════════════════════════════════════════
# LISTAR
# ═════════════════════════════════════════════════════════════════════
@router.get("/", response_model=PaginatedPruebasTOResponse)
def listar_pruebas(
    skip: int = 0,
    limit: int = 10,
    estado: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol == "admin":
        base = select(PruebaTrabajoTO)
    else:
        base = select(PruebaTrabajoTO).where(PruebaTrabajoTO.creado_por == current_user.id)

    if estado and estado != "todos":
        base = base.where(PruebaTrabajoTO.estado == estado)

    total = session.exec(select(func.count()).select_from(base.subquery())).one()
    pruebas = session.exec(base.offset(skip).limit(limit).order_by(PruebaTrabajoTO.fecha_creacion.desc())).all()

    items = []
    for p in pruebas:
        ident = session.exec(select(IdentificacionTO).where(IdentificacionTO.prueba_id == p.id)).first()
        items.append(PruebaTrabajoTOListItem(
            id=p.id,
            estado=p.estado,
            fecha_creacion=p.fecha_creacion,
            fecha_actualizacion=p.fecha_actualizacion,
            trabajador_nombre=ident.nombre_trabajador if ident else None,
            trabajador_documento=ident.numero_documento if ident else None,
            empresa=ident.empresa if ident else None,
        ))

    return PaginatedPruebasTOResponse(items=items, total=total)


# ═════════════════════════════════════════════════════════════════════
# OBTENER POR ID
# ═════════════════════════════════════════════════════════════════════
@router.get("/{prueba_id}", response_model=PruebaTrabajoTOResponse)
def obtener_prueba(
    prueba_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    prueba = session.get(PruebaTrabajoTO, prueba_id)
    if not prueba:
        raise HTTPException(404, "Prueba no encontrada")
    _check_permission(prueba, current_user)
    return _build_response(prueba, session)


# ═════════════════════════════════════════════════════════════════════
# CREAR
# ═════════════════════════════════════════════════════════════════════
@router.post("/", response_model=PruebaTrabajoTOResponse, status_code=201)
def crear_prueba(
    data: PruebaTrabajoTOCreate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    prueba = PruebaTrabajoTO(
        estado=EstadoPruebaTO.BORRADOR,
        creado_por=current_user.id,
        fecha_creacion=datetime.utcnow(),
        fecha_actualizacion=datetime.utcnow(),
    )
    session.add(prueba)
    session.commit()
    session.refresh(prueba)

    _save_children(prueba.id, data, session)
    session.commit()
    session.refresh(prueba)

    return _build_response(prueba, session)


# ═════════════════════════════════════════════════════════════════════
# ACTUALIZAR
# ═════════════════════════════════════════════════════════════════════
@router.put("/{prueba_id}", response_model=PruebaTrabajoTOResponse)
def actualizar_prueba(
    prueba_id: int,
    data: PruebaTrabajoTOUpdate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    prueba = session.get(PruebaTrabajoTO, prueba_id)
    if not prueba:
        raise HTTPException(404, "Prueba no encontrada")
    _check_permission(prueba, current_user)

    if data.estado:
        prueba.estado = data.estado
    prueba.fecha_actualizacion = datetime.utcnow()
    session.add(prueba)

    # Borrar hijos existentes y recrear
    _delete_children(prueba_id, session)
    _save_children(prueba_id, data, session)

    session.commit()
    session.refresh(prueba)
    return _build_response(prueba, session)


# ═════════════════════════════════════════════════════════════════════
# ELIMINAR
# ═════════════════════════════════════════════════════════════════════
@router.delete("/{prueba_id}", status_code=204)
def eliminar_prueba(
    prueba_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    prueba = session.get(PruebaTrabajoTO, prueba_id)
    if not prueba:
        raise HTTPException(404, "Prueba no encontrada")
    _check_permission(prueba, current_user)

    _delete_children(prueba_id, session)
    session.delete(prueba)
    session.commit()
    return None


# ═════════════════════════════════════════════════════════════════════
# FINALIZAR + PDF
# ═════════════════════════════════════════════════════════════════════
@router.post("/{prueba_id}/finalizar", response_model=FinalizarPruebaTOResponse)
def finalizar_prueba(
    prueba_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    prueba = session.get(PruebaTrabajoTO, prueba_id)
    if not prueba:
        raise HTTPException(404, "Prueba no encontrada")
    _check_permission(prueba, current_user)

    # Cargar datos
    ident = session.exec(select(IdentificacionTO).where(IdentificacionTO.prueba_id == prueba_id)).first()
    secciones = session.exec(select(SeccionesTextoTO).where(SeccionesTextoTO.prueba_id == prueba_id)).first()
    desempeno = session.exec(select(DesempenoOrgTO).where(DesempenoOrgTO.prueba_id == prueba_id)).first()
    tareas = session.exec(select(TareaTO).where(TareaTO.prueba_id == prueba_id).order_by(TareaTO.orden)).all()
    materiales = session.exec(select(MaterialEquipoTO).where(MaterialEquipoTO.prueba_id == prueba_id).order_by(MaterialEquipoTO.orden)).all()
    peligros = session.exec(select(PeligroProcesoTO).where(PeligroProcesoTO.prueba_id == prueba_id)).all()
    recomendaciones = session.exec(select(RecomendacionesTO).where(RecomendacionesTO.prueba_id == prueba_id)).first()
    registro = session.exec(select(RegistroTO).where(RegistroTO.prueba_id == prueba_id)).first()

    try:
        from app.services.pdf_generator_prueba_trabajo_to import generar_pdf_prueba_trabajo_to

        pdf_path = generar_pdf_prueba_trabajo_to(
            prueba=prueba,
            identificacion=ident,
            secciones=secciones,
            desempeno=desempeno,
            tareas=list(tareas),
            materiales=list(materiales),
            peligros=list(peligros),
            recomendaciones=recomendaciones,
            registro=registro,
            output_dir="pdfs",
        )

        pdf_filename = Path(pdf_path).name
        pdf_url = f"/pdfs/{pdf_filename}"

        prueba.estado = EstadoPruebaTO.COMPLETADA
        prueba.fecha_finalizacion = datetime.utcnow()
        prueba.fecha_actualizacion = datetime.utcnow()
        session.add(prueba)
        session.commit()
        session.refresh(prueba)

        return FinalizarPruebaTOResponse(
            message="Prueba finalizada exitosamente",
            prueba_id=prueba.id,
            pdf_url=pdf_url,
        )
    except Exception as e:
        session.rollback()
        raise HTTPException(500, f"Error al finalizar: {str(e)}")


# ═════════════════════════════════════════════════════════════════════
# DESCARGAR PDF
# ═════════════════════════════════════════════════════════════════════
@router.get("/{prueba_id}/descargar-pdf")
def descargar_pdf(
    prueba_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user),
):
    prueba = session.get(PruebaTrabajoTO, prueba_id)
    if not prueba:
        raise HTTPException(404, "Prueba no encontrada")
    _check_permission(prueba, current_user)

    if prueba.estado != EstadoPruebaTO.COMPLETADA:
        raise HTTPException(400, "La prueba debe estar completada para descargar el PDF")

    # Regenerar PDF
    ident = session.exec(select(IdentificacionTO).where(IdentificacionTO.prueba_id == prueba_id)).first()
    secciones = session.exec(select(SeccionesTextoTO).where(SeccionesTextoTO.prueba_id == prueba_id)).first()
    desempeno = session.exec(select(DesempenoOrgTO).where(DesempenoOrgTO.prueba_id == prueba_id)).first()
    tareas = session.exec(select(TareaTO).where(TareaTO.prueba_id == prueba_id).order_by(TareaTO.orden)).all()
    materiales = session.exec(select(MaterialEquipoTO).where(MaterialEquipoTO.prueba_id == prueba_id).order_by(MaterialEquipoTO.orden)).all()
    peligros = session.exec(select(PeligroProcesoTO).where(PeligroProcesoTO.prueba_id == prueba_id)).all()
    recomendaciones = session.exec(select(RecomendacionesTO).where(RecomendacionesTO.prueba_id == prueba_id)).first()
    registro = session.exec(select(RegistroTO).where(RegistroTO.prueba_id == prueba_id)).first()

    from app.services.pdf_generator_prueba_trabajo_to import generar_pdf_prueba_trabajo_to

    pdf_path = generar_pdf_prueba_trabajo_to(
        prueba=prueba,
        identificacion=ident,
        secciones=secciones,
        desempeno=desempeno,
        tareas=list(tareas),
        materiales=list(materiales),
        peligros=list(peligros),
        recomendaciones=recomendaciones,
        registro=registro,
        output_dir="pdfs",
    )

    nombre_archivo = f"Prueba_Trabajo_TO_{prueba_id}.pdf"
    return FileResponse(pdf_path, filename=nombre_archivo, media_type="application/pdf")


# ═════════════════════════════════════════════════════════════════════
# HELPERS INTERNOS
# ═════════════════════════════════════════════════════════════════════

def _save_children(prueba_id: int, data, session: Session):
    """Guarda todas las relaciones hijas de una prueba."""
    if data.identificacion:
        session.add(IdentificacionTO(prueba_id=prueba_id, **data.identificacion.model_dump()))

    if data.secciones_texto:
        session.add(SeccionesTextoTO(prueba_id=prueba_id, **data.secciones_texto.model_dump()))

    if data.desempeno_organizacional:
        session.add(DesempenoOrgTO(prueba_id=prueba_id, **data.desempeno_organizacional.model_dump()))

    if data.tareas:
        for i, t in enumerate(data.tareas):
            d = t.model_dump()
            d["orden"] = i
            session.add(TareaTO(prueba_id=prueba_id, **d))

    if data.materiales_equipos:
        for i, m in enumerate(data.materiales_equipos):
            d = m.model_dump()
            d["orden"] = i
            session.add(MaterialEquipoTO(prueba_id=prueba_id, **d))

    if data.peligros:
        for p in data.peligros:
            session.add(PeligroProcesoTO(prueba_id=prueba_id, **p.model_dump()))

    if data.recomendaciones:
        session.add(RecomendacionesTO(prueba_id=prueba_id, **data.recomendaciones.model_dump()))

    if data.registro:
        session.add(RegistroTO(prueba_id=prueba_id, **data.registro.model_dump()))


def _delete_children(prueba_id: int, session: Session):
    """Elimina todas las relaciones hijas de una prueba."""
    for Model in [RegistroTO, RecomendacionesTO, PeligroProcesoTO,
                  MaterialEquipoTO, TareaTO, DesempenoOrgTO,
                  SeccionesTextoTO, IdentificacionTO]:
        items = session.exec(select(Model).where(Model.prueba_id == prueba_id)).all()
        for item in items:
            session.delete(item)
