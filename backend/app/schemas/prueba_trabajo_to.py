"""
Schemas Pydantic para el módulo Prueba de Trabajo TO
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


# ── Identificación (Sección 1) ──────────────────────────────────────
class IdentificacionTOCreate(BaseModel):
    fecha_valoracion: Optional[date] = None
    ultimo_dia_incapacidad: Optional[date] = None
    nombre_trabajador: Optional[str] = None
    numero_documento: Optional[str] = None
    id_siniestro: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    edad: Optional[int] = None
    dominancia: Optional[str] = None
    estado_civil: Optional[str] = None
    nivel_educativo: Optional[str] = None
    telefonos_trabajador: Optional[str] = None
    direccion_residencia: Optional[str] = None
    diagnosticos_atel: Optional[str] = None
    fechas_eventos_atel: Optional[str] = None
    eps_ips: Optional[str] = None
    afp: Optional[str] = None
    tiempo_incapacidad_dias: Optional[int] = None
    empresa: Optional[str] = None
    nit_empresa: Optional[str] = None
    cargo_actual: Optional[str] = None
    cargo_unico: Optional[bool] = None
    area_seccion: Optional[str] = None
    fecha_ingreso_cargo: Optional[date] = None
    antiguedad_cargo: Optional[str] = None
    fecha_ingreso_empresa: Optional[date] = None
    antiguedad_empresa: Optional[str] = None
    forma_vinculacion: Optional[str] = None
    modalidad: Optional[str] = None
    tiempo_modalidad: Optional[str] = None
    contacto_empresa: Optional[str] = None
    correos_electronicos: Optional[str] = None
    telefonos_empresa: Optional[str] = None
    direccion_empresa: Optional[str] = None


# ── Secciones de texto (2, 3.1-3.3, 6.1, 7) ────────────────────────
class SeccionesTextoTOCreate(BaseModel):
    metodologia: Optional[str] = None
    descripcion_proceso_productivo: Optional[str] = None
    apreciacion_trabajador_proceso: Optional[str] = None
    estandares_productividad: Optional[str] = None
    verificacion_acciones_correctivas: Optional[str] = None
    concepto_prueba_trabajo: Optional[str] = None


# ── Desempeño Organizacional (3.4) ──────────────────────────────────
class DesempenoOrgTOCreate(BaseModel):
    jornada: Optional[str] = None
    ritmo: Optional[str] = None
    descansos_programados: Optional[str] = None
    turnos: Optional[str] = None
    tiempos_efectivos: Optional[str] = None
    rotaciones: Optional[str] = None
    horas_extras: Optional[str] = None
    distribucion_semanal: Optional[str] = None


# ── Tarea (Sección 4) ───────────────────────────────────────────────
class TareaTOCreate(BaseModel):
    actividad: Optional[str] = None
    ciclo: Optional[str] = None
    subactividad: Optional[str] = None
    estandar_productividad: Optional[str] = None
    registro_fotografico: Optional[str] = None
    descripcion_biomecanica: Optional[str] = None
    apreciacion_trabajador: Optional[str] = None
    apreciacion_profesional: Optional[str] = None
    conclusion: Optional[str] = None
    descripcion_conclusion: Optional[str] = None
    orden: int = 0


# ── Material/Equipo (Sección 5) ─────────────────────────────────────
class MaterialEquipoTOCreate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    requerimientos_operacion: Optional[str] = None
    observaciones: Optional[str] = None
    orden: int = 0


# ── Peligro del Proceso (Sección 6) ─────────────────────────────────
class PeligroProcesoTOCreate(BaseModel):
    categoria: str
    descripcion: Optional[str] = None
    tipos_control_existente: Optional[str] = None
    recomendaciones_control: Optional[str] = None


# ── Recomendaciones (Sección 8) ──────────────────────────────────────
class RecomendacionesTOCreate(BaseModel):
    para_trabajador: Optional[str] = None
    para_empresa: Optional[str] = None


# ── Registro / Firmas (Sección 9) ───────────────────────────────────
class RegistroTOCreate(BaseModel):
    nombre_elaboro: Optional[str] = None
    firma_elaboro: Optional[str] = None
    nombre_revisor: Optional[str] = None
    firma_revisor: Optional[str] = None
    nombre_proveedor: Optional[str] = None


# ══════════════════════════════════════════════════════════════════════
# Schemas monolíticos (Create / Update)
# ══════════════════════════════════════════════════════════════════════

class PruebaTrabajoTOCreate(BaseModel):
    identificacion: Optional[IdentificacionTOCreate] = None
    secciones_texto: Optional[SeccionesTextoTOCreate] = None
    desempeno_organizacional: Optional[DesempenoOrgTOCreate] = None
    tareas: Optional[List[TareaTOCreate]] = None
    materiales_equipos: Optional[List[MaterialEquipoTOCreate]] = None
    peligros: Optional[List[PeligroProcesoTOCreate]] = None
    recomendaciones: Optional[RecomendacionesTOCreate] = None
    registro: Optional[RegistroTOCreate] = None
    estado: Optional[str] = None


class PruebaTrabajoTOUpdate(BaseModel):
    identificacion: Optional[IdentificacionTOCreate] = None
    secciones_texto: Optional[SeccionesTextoTOCreate] = None
    desempeno_organizacional: Optional[DesempenoOrgTOCreate] = None
    tareas: Optional[List[TareaTOCreate]] = None
    materiales_equipos: Optional[List[MaterialEquipoTOCreate]] = None
    peligros: Optional[List[PeligroProcesoTOCreate]] = None
    recomendaciones: Optional[RecomendacionesTOCreate] = None
    registro: Optional[RegistroTOCreate] = None
    estado: Optional[str] = None


# ══════════════════════════════════════════════════════════════════════
# Schemas de respuesta
# ══════════════════════════════════════════════════════════════════════

class PruebaTrabajoTOResponse(BaseModel):
    id: int
    estado: str
    creado_por: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    fecha_finalizacion: Optional[datetime] = None
    identificacion: Optional[IdentificacionTOCreate] = None
    secciones_texto: Optional[SeccionesTextoTOCreate] = None
    desempeno_organizacional: Optional[DesempenoOrgTOCreate] = None
    tareas: Optional[List[TareaTOCreate]] = None
    materiales_equipos: Optional[List[MaterialEquipoTOCreate]] = None
    peligros: Optional[List[PeligroProcesoTOCreate]] = None
    recomendaciones: Optional[RecomendacionesTOCreate] = None
    registro: Optional[RegistroTOCreate] = None

    class Config:
        from_attributes = True


class PruebaTrabajoTOListItem(BaseModel):
    id: int
    estado: str
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    trabajador_nombre: Optional[str] = None
    trabajador_documento: Optional[str] = None
    empresa: Optional[str] = None


class PaginatedPruebasTOResponse(BaseModel):
    items: List[PruebaTrabajoTOListItem]
    total: int


class FinalizarPruebaTOResponse(BaseModel):
    message: str
    prueba_id: int
    pdf_url: str
