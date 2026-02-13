"""
Modelos SQLModel para el módulo Prueba de Trabajo TO (Terapia Ocupacional)
Formato basado en Positiva S.A. - Valoración Prueba de Trabajo
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


# ── Enums ────────────────────────────────────────────────────────────
class EstadoPruebaTO(str, Enum):
    BORRADOR = "borrador"
    COMPLETADA = "completada"

class Dominancia(str, Enum):
    DERECHA = "derecha"
    IZQUIERDA = "izquierda"
    AMBIDIESTRA = "ambidiestra"

class NivelEducativoTO(str, Enum):
    FORMACION_EMPIRICA = "formacion_empirica"
    BASICA_PRIMARIA = "basica_primaria"
    BACHILLERATO_VOCACIONAL = "bachillerato_vocacional"
    BACHILLERATO_MODALIDAD = "bachillerato_modalidad"
    TECNICO_TECNOLOGICO = "tecnico_tecnologico"
    PROFESIONAL = "profesional"
    ESPECIALIZACION_POSTGRADO = "especializacion_postgrado"
    FORMACION_INFORMAL = "formacion_informal"
    ANALFABETA = "analfabeta"
    OTROS = "otros"

class ModalidadTO(str, Enum):
    PRESENCIAL = "presencial"
    TELETRABAJO = "teletrabajo"
    TRABAJO_EN_CASA = "trabajo_en_casa"

class ConclusionTarea(str, Enum):
    REINTEGRO_SIN_MODIFICACIONES = "reintegro_sin_modificaciones"
    REINTEGRO_CON_MODIFICACIONES = "reintegro_con_modificaciones"
    DESARROLLO_CAPACIDADES = "desarrollo_capacidades"
    NO_PUEDE_DESEMPENARLA = "no_puede_desempenarla"

class CategoriaPeligro(str, Enum):
    FISICOS = "fisicos"
    BIOLOGICOS = "biologicos"
    BIOMECANICOS = "biomecanicos"
    PSICOSOCIALES = "psicosociales"
    QUIMICOS = "quimicos"
    COND_SEGURIDAD = "cond_seguridad"


# ── Tabla principal ──────────────────────────────────────────────────
class PruebaTrabajoTO(SQLModel, table=True):
    __tablename__ = "pruebas_trabajo_to"

    id: Optional[int] = Field(default=None, primary_key=True)
    estado: EstadoPruebaTO = Field(default=EstadoPruebaTO.BORRADOR)
    creado_por: int = Field(foreign_key="usuarios.id")
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_actualizacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_finalizacion: Optional[datetime] = None


# ── Sección 1: Identificación ───────────────────────────────────────
class IdentificacionTO(SQLModel, table=True):
    __tablename__ = "identificacion_to"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="pruebas_trabajo_to.id", index=True)

    # Fechas principales
    fecha_valoracion: Optional[date] = None
    ultimo_dia_incapacidad: Optional[date] = None

    # Datos trabajador
    nombre_trabajador: Optional[str] = None
    tipo_documento: Optional[str] = None  # CC, CE, TI, NIT, etc.
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


# ── Secciones de texto libre (2, 3.1, 3.2, 3.3, 6.1, 7) ────────────
class SeccionesTextoTO(SQLModel, table=True):
    __tablename__ = "secciones_texto_to"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="pruebas_trabajo_to.id", index=True)

    metodologia: Optional[str] = None                      # Sección 2
    descripcion_proceso_productivo: Optional[str] = None   # Sección 3.1
    apreciacion_trabajador_proceso: Optional[str] = None   # Sección 3.2
    estandares_productividad: Optional[str] = None         # Sección 3.3
    verificacion_acciones_correctivas: Optional[str] = None  # Sección 6.1
    concepto_prueba_trabajo: Optional[str] = None          # Sección 7

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Sección 3.4: Requerimientos del Desempeño Organizacional ────────
class DesempenoOrgTO(SQLModel, table=True):
    __tablename__ = "desempeno_org_to"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="pruebas_trabajo_to.id", index=True)

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


# ── Sección 4: Tarea (1:N) ──────────────────────────────────────────
class TareaTO(SQLModel, table=True):
    __tablename__ = "tareas_to"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="pruebas_trabajo_to.id", index=True)

    actividad: Optional[str] = None
    ciclo: Optional[str] = None
    subactividad: Optional[str] = None
    estandar_productividad: Optional[str] = None
    registro_fotografico: Optional[str] = None        # ruta del archivo o base64
    descripcion_biomecanica: Optional[str] = None
    apreciacion_trabajador: Optional[str] = None
    apreciacion_profesional: Optional[str] = None
    conclusion: Optional[str] = None                  # ConclusionTarea enum value
    descripcion_conclusion: Optional[str] = None
    orden: int = Field(default=0)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Sección 5: Material/Equipo/Herramienta (1:N) ────────────────────
class MaterialEquipoTO(SQLModel, table=True):
    __tablename__ = "materiales_equipos_to"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="pruebas_trabajo_to.id", index=True)

    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    requerimientos_operacion: Optional[str] = None
    observaciones: Optional[str] = None
    orden: int = Field(default=0)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Sección 6: Peligros del Proceso Productivo ──────────────────────
class PeligroProcesoTO(SQLModel, table=True):
    __tablename__ = "peligros_proceso_to"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="pruebas_trabajo_to.id", index=True)

    categoria: str                                     # CategoriaPeligro value
    descripcion: Optional[str] = None
    tipos_control_existente: Optional[str] = None
    recomendaciones_control: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Sección 8: Recomendaciones ───────────────────────────────────────
class RecomendacionesTO(SQLModel, table=True):
    __tablename__ = "recomendaciones_to"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="pruebas_trabajo_to.id", index=True)

    para_trabajador: Optional[str] = None
    para_empresa: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Sección 9: Registro / Firmas ────────────────────────────────────
class RegistroTO(SQLModel, table=True):
    __tablename__ = "registro_to"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="pruebas_trabajo_to.id", index=True)

    nombre_elaboro: Optional[str] = None
    firma_elaboro: Optional[str] = None           # ruta o base64
    nombre_revisor: Optional[str] = None
    firma_revisor: Optional[str] = None            # ruta o base64
    nombre_proveedor: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
