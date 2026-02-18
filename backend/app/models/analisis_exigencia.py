"""
Modelos SQLModel para el módulo Análisis de Exigencia (Terapia Ocupacional)
Formato basado en Positiva S.A. - Análisis de Exigencia del Cargo
"""
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date
from enum import Enum


# ── Enums ────────────────────────────────────────────────────────────
class EstadoAnalisisExigencia(str, Enum):
    BORRADOR = "borrador"
    COMPLETADA = "completada"


# Reutilizamos los mismos enums de prueba_trabajo_to
class ConclusionTareaAE(str, Enum):
    REINTEGRO_SIN_MODIFICACIONES = "reintegro_sin_modificaciones"
    REINTEGRO_CON_MODIFICACIONES = "reintegro_con_modificaciones"
    DESARROLLO_CAPACIDADES = "desarrollo_capacidades"
    NO_PUEDE_DESEMPENARLA = "no_puede_desempenarla"


class CategoriaPeligroAE(str, Enum):
    FISICOS = "fisicos"
    BIOLOGICOS = "biologicos"
    BIOMECANICOS = "biomecanicos"
    PSICOSOCIALES = "psicosociales"
    QUIMICOS = "quimicos"
    COND_SEGURIDAD = "cond_seguridad"


# ── Tabla principal ──────────────────────────────────────────────────
class AnalisisExigencia(SQLModel, table=True):
    __tablename__ = "analisis_exigencia"

    id: Optional[int] = Field(default=None, primary_key=True)
    estado: EstadoAnalisisExigencia = Field(default=EstadoAnalisisExigencia.BORRADOR)
    creado_por: int = Field(foreign_key="usuarios.id")
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_actualizacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_finalizacion: Optional[datetime] = None


# ── Sección 1: Identificación ───────────────────────────────────────
class IdentificacionAE(SQLModel, table=True):
    __tablename__ = "identificacion_ae"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="analisis_exigencia.id", index=True)

    # Fechas principales
    fecha_valoracion: Optional[date] = None
    ultimo_dia_incapacidad: Optional[date] = None

    # Datos trabajador
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

    # Datos clínicos
    diagnosticos_atel: Optional[str] = None
    fechas_eventos_atel: Optional[str] = None
    eps_ips: Optional[str] = None
    afp: Optional[str] = None
    tiempo_incapacidad_dias: Optional[int] = None

    # Datos empresa
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

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Secciones de texto libre (2, 3.1, 6.1, 7) ───────────────────────
class SeccionesTextoAE(SQLModel, table=True):
    __tablename__ = "secciones_texto_ae"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="analisis_exigencia.id", index=True)

    metodologia: Optional[str] = None                      # Sección 2
    descripcion_proceso_productivo: Optional[str] = None   # Sección 3.1
    apreciacion_trabajador_proceso: Optional[str] = None   # Sección 3.2
    estandares_productividad: Optional[str] = None         # Sección 3.3
    verificacion_acciones_correctivas: Optional[str] = None  # Sección 6.1
    concepto_prueba_trabajo: Optional[str] = None          # Sección 7

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Sección 3.2: Requerimientos del Desempeño Organizacional ────────
class DesempenoOrgAE(SQLModel, table=True):
    __tablename__ = "desempeno_org_ae"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="analisis_exigencia.id", index=True)

    jornada: Optional[str] = None
    ritmo: Optional[str] = None
    descansos_programados: Optional[str] = None
    turnos: Optional[str] = None
    tiempos_efectivos: Optional[str] = None
    rotaciones: Optional[str] = None
    horas_extras: Optional[str] = None
    distribucion_semanal: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Sección 4: Tarea (1:N) — con requerimientos motrices ────────────
class TareaAE(SQLModel, table=True):
    __tablename__ = "tareas_ae"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="analisis_exigencia.id", index=True)

    actividad: Optional[str] = None
    ciclo: Optional[str] = None
    subactividad: Optional[str] = None
    estandar_productividad: Optional[str] = None
    registro_fotografico: Optional[str] = None
    descripcion_biomecanica: Optional[str] = None
    requerimientos_motrices: Optional[str] = None          # Campo nuevo vs Prueba Trabajo TO
    apreciacion_trabajador: Optional[str] = None
    apreciacion_profesional: Optional[str] = None
    conclusion: Optional[str] = None
    descripcion_conclusion: Optional[str] = None
    orden: int = Field(default=0)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Sección 5: Material/Equipo/Herramienta (1:N) — con estado ───────
class MaterialEquipoAE(SQLModel, table=True):
    __tablename__ = "materiales_equipos_ae"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="analisis_exigencia.id", index=True)

    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None                            # Campo nuevo vs Prueba Trabajo TO
    requerimientos_operacion: Optional[str] = None
    observaciones: Optional[str] = None
    orden: int = Field(default=0)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Sección 6: Peligros del Proceso Productivo ──────────────────────
class PeligroProcesoAE(SQLModel, table=True):
    __tablename__ = "peligros_proceso_ae"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="analisis_exigencia.id", index=True)

    categoria: str
    descripcion: Optional[str] = None
    tipos_control_existente: Optional[str] = None
    recomendaciones_control: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Sección 8: Recomendaciones ───────────────────────────────────────
class RecomendacionesAE(SQLModel, table=True):
    __tablename__ = "recomendaciones_ae"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="analisis_exigencia.id", index=True)

    para_trabajador: Optional[str] = None
    para_empresa: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Sección 9: Registro / Firmas ────────────────────────────────────
class RegistroAE(SQLModel, table=True):
    __tablename__ = "registro_ae"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="analisis_exigencia.id", index=True)

    nombre_elaboro: Optional[str] = None
    firma_elaboro: Optional[str] = None
    licencia_so_elaboro: Optional[str] = None
    nombre_revisor: Optional[str] = None
    firma_revisor: Optional[str] = None
    licencia_so_revisor: Optional[str] = None
    nombre_proveedor: Optional[str] = None
    firma_trabajador: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Sección 6: Perfil de Exigencias (JSON Columns) ──────────────────
from sqlalchemy import JSON, Column
from typing import Dict, Any

class PerfilExigenciasAE(SQLModel, table=True):
    __tablename__ = "perfil_exigencias_ae"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="analisis_exigencia.id", index=True)

    sensopercepcion: Optional[Dict] = Field(default={}, sa_column=Column(JSON))
    motricidad_gruesa: Optional[Dict] = Field(default={}, sa_column=Column(JSON))
    motricidad_fina: Optional[Dict] = Field(default={}, sa_column=Column(JSON))
    armonia: Optional[Dict] = Field(default={}, sa_column=Column(JSON))
    cognitivos: Optional[Dict] = Field(default={}, sa_column=Column(JSON))
    psicosociales: Optional[Dict] = Field(default={}, sa_column=Column(JSON))

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
