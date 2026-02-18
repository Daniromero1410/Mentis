"""
Schemas Pydantic para el módulo Análisis de Exigencia
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


# ── Identificación (Sección 1) ──────────────────────────────────────
class IdentificacionAECreate(BaseModel):
    fecha_valoracion: Optional[date] = None
    ultimo_dia_incapacidad: Optional[date] = None
    nombre_trabajador: Optional[str] = None
    tipo_documento: Optional[str] = None
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

    class Config:
        from_attributes = True


# ── Secciones de texto (2, 3.1-3.3, 6.1, 7) ────────────────────────
class SeccionesTextoAECreate(BaseModel):
    metodologia: Optional[str] = None
    descripcion_proceso_productivo: Optional[str] = None
    apreciacion_trabajador_proceso: Optional[str] = None
    estandares_productividad: Optional[str] = None
    verificacion_acciones_correctivas: Optional[str] = None
    concepto_prueba_trabajo: Optional[str] = None

    class Config:
        from_attributes = True


# ── Desempeño Organizacional (3.2) ──────────────────────────────────
class DesempenoOrgAECreate(BaseModel):
    jornada: Optional[str] = None
    ritmo: Optional[str] = None
    descansos_programados: Optional[str] = None
    turnos: Optional[str] = None
    tiempos_efectivos: Optional[str] = None
    rotaciones: Optional[str] = None
    horas_extras: Optional[str] = None
    distribucion_semanal: Optional[str] = None

    class Config:
        from_attributes = True


# ── Tarea (Sección 4) — con requerimientos motrices ─────────────────
class TareaAECreate(BaseModel):
    actividad: Optional[str] = None
    ciclo: Optional[str] = None
    subactividad: Optional[str] = None
    estandar_productividad: Optional[str] = None
    registro_fotografico: Optional[str] = None
    descripcion_biomecanica: Optional[str] = None
    requerimientos_motrices: Optional[str] = None
    apreciacion_trabajador: Optional[str] = None
    apreciacion_profesional: Optional[str] = None
    conclusion: Optional[str] = None
    descripcion_conclusion: Optional[str] = None
    orden: int = 0

    class Config:
        from_attributes = True


# ── Material/Equipo (Sección 5) — con estado ────────────────────────
class MaterialEquipoAECreate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None
    requerimientos_operacion: Optional[str] = None
    observaciones: Optional[str] = None
    orden: int = 0

    class Config:
        from_attributes = True


# ── Peligro del Proceso (Sección 6) ─────────────────────────────────
class PeligroProcesoAECreate(BaseModel):
    categoria: str
    descripcion: Optional[str] = None
    tipos_control_existente: Optional[str] = None
    recomendaciones_control: Optional[str] = None

    class Config:
        from_attributes = True


# ── Recomendaciones (Sección 8) ──────────────────────────────────────
class RecomendacionesAECreate(BaseModel):
    para_trabajador: Optional[str] = None
    para_empresa: Optional[str] = None

    class Config:
        from_attributes = True


# ── Registro / Firmas (Sección 9) ───────────────────────────────────
class RegistroAECreate(BaseModel):
    nombre_elaboro: Optional[str] = None
    firma_elaboro: Optional[str] = None
    licencia_so_elaboro: Optional[str] = None
    nombre_revisor: Optional[str] = None
    firma_revisor: Optional[str] = None
    licencia_so_revisor: Optional[str] = None
    nombre_proveedor: Optional[str] = None
    firma_trabajador: Optional[str] = None

    class Config:
        from_attributes = True


# ── Perfil de Exigencias (Sección 6) ────────────────────────────────
class PerfilExigenciasAECreate(BaseModel):
    sensopercepcion: Optional[dict] = {}
    motricidad_gruesa: Optional[dict] = {}
    motricidad_fina: Optional[dict] = {}
    armonia: Optional[dict] = {}
    cognitivos: Optional[dict] = {}
    psicosociales: Optional[dict] = {}

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════════════════
# Schemas monolíticos (Create / Update)
# ══════════════════════════════════════════════════════════════════════

class AnalisisExigenciaCreate(BaseModel):
    identificacion: Optional[IdentificacionAECreate] = None
    secciones_texto: Optional[SeccionesTextoAECreate] = None
    desempeno_organizacional: Optional[DesempenoOrgAECreate] = None
    tareas: Optional[List[TareaAECreate]] = None
    materiales_equipos: Optional[List[MaterialEquipoAECreate]] = None
    peligros: Optional[List[PeligroProcesoAECreate]] = None
    recomendaciones: Optional[RecomendacionesAECreate] = None
    perfil_exigencias: Optional[PerfilExigenciasAECreate] = None
    registro: Optional[RegistroAECreate] = None
    estado: Optional[str] = None


class AnalisisExigenciaUpdate(BaseModel):
    identificacion: Optional[IdentificacionAECreate] = None
    secciones_texto: Optional[SeccionesTextoAECreate] = None
    desempeno_organizacional: Optional[DesempenoOrgAECreate] = None
    tareas: Optional[List[TareaAECreate]] = None
    materiales_equipos: Optional[List[MaterialEquipoAECreate]] = None
    peligros: Optional[List[PeligroProcesoAECreate]] = None
    recomendaciones: Optional[RecomendacionesAECreate] = None
    perfil_exigencias: Optional[PerfilExigenciasAECreate] = None
    registro: Optional[RegistroAECreate] = None
    estado: Optional[str] = None


# ══════════════════════════════════════════════════════════════════════
# Response schemas
# ══════════════════════════════════════════════════════════════════════

class AnalisisExigenciaResponse(BaseModel):
    id: int
    estado: str
    creado_por: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    fecha_finalizacion: Optional[datetime] = None

    identificacion: Optional[IdentificacionAECreate] = None
    secciones_texto: Optional[SeccionesTextoAECreate] = None
    desempeno_organizacional: Optional[DesempenoOrgAECreate] = None
    tareas: Optional[List[TareaAECreate]] = None
    materiales_equipos: Optional[List[MaterialEquipoAECreate]] = None
    peligros: Optional[List[PeligroProcesoAECreate]] = None
    recomendaciones: Optional[RecomendacionesAECreate] = None
    perfil_exigencias: Optional[PerfilExigenciasAECreate] = None
    registro: Optional[RegistroAECreate] = None

    class Config:
        from_attributes = True


class AnalisisExigenciaListItem(BaseModel):
    id: int
    estado: str
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    trabajador_nombre: Optional[str] = None
    trabajador_tipo_documento: Optional[str] = None
    trabajador_documento: Optional[str] = None
    empresa: Optional[str] = None

    class Config:
        from_attributes = True


class AnalisisExigenciaListResponse(BaseModel):
    items: List[AnalisisExigenciaListItem]
    total: int
