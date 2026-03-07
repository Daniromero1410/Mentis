"""
Modelos SQLModel para el módulo Valoración Ocupacional (Terapia Ocupacional)
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


# ── Enums ────────────────────────────────────────────────────────────
class EstadoValoracion(str, Enum):
    BORRADOR = "borrador"
    COMPLETADA = "completada"


# ── Tabla principal ──────────────────────────────────────────────────
class ValoracionOcupacional(SQLModel, table=True):
    __tablename__ = "valoraciones_ocupacionales"

    id: Optional[int] = Field(default=None, primary_key=True)
    estado: EstadoValoracion = Field(default=EstadoValoracion.BORRADOR)
    creado_por: int = Field(foreign_key="usuarios.id")
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_actualizacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_finalizacion: Optional[datetime] = None


# ── Secciones Texto / Otros ──────────────────────────────────────────
class SeccionesTextoVO(SQLModel, table=True):
    __tablename__ = "secciones_texto_vo"

    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones_ocupacionales.id", index=True)

    objetivo_valoracion: Optional[str] = None
    otros_oficios_desempenados: Optional[str] = None
    oficios_interes: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Sección 2: Identificación ───────────────────────────────────────
class IdentificacionVO(SQLModel, table=True):
    __tablename__ = "identificacion_vo"

    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones_ocupacionales.id", index=True)

    fecha_valoracion: Optional[date] = None

    # Datos trabajador
    nombre_trabajador: Optional[str] = None
    numero_documento: Optional[str] = None
    identificacion_siniestro: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    edad: Optional[int] = None
    dominancia: Optional[str] = None                 # Derecha, Izquierda, Ambidiestra
    estado_civil: Optional[str] = None
    nivel_educativo: Optional[str] = None            # Enum/Texto + Extra format
    especificar_formacion: Optional[str] = None
    telefonos_trabajador: Optional[str] = None
    direccion_residencia: Optional[str] = None
    zona_residencia: Optional[str] = None            # Urbano, Rural
    diagnosticos_atel: Optional[str] = None
    fechas_eventos_atel: Optional[str] = None
    
    # Eventos No laborales aplanados desde Identificacion (Frontend)
    eventos_no_laborales: Optional[str] = None
    eventos_no_laborales_fecha: Optional[str] = None
    eventos_no_laborales_diagnostico: Optional[str] = None

    
    eps_ips: Optional[str] = None
    afp: Optional[str] = None
    tiempo_incapacidad_dias: Optional[str] = None

    # Datos empresa
    empresa: Optional[str] = None
    vinculacion_laboral: Optional[bool] = None       # SI/NO
    forma_vinculacion: Optional[str] = None
    modalidad: Optional[str] = None                  # Presencial, teletrabajo, etc
    tiempo_modalidad: Optional[str] = None
    nit_empresa: Optional[str] = None
    fecha_ingreso_empresa: Optional[date] = None
    antiguedad_empresa: Optional[str] = None
    contacto_empresa: Optional[str] = None
    correos_empresa: Optional[str] = None
    telefonos_empresa: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class EventoNoLaboralVO(SQLModel, table=True):
    __tablename__ = "eventos_nolaborales_vo"

    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones_ocupacionales.id", index=True)

    si_no: Optional[str] = None
    fecha: Optional[str] = None
    diagnostico: Optional[str] = None
    orden: int = Field(default=0)


# ── Sección 3: Historia Ocupacional ──────────────────────────────────
class HistoriaOcupacionalVO(SQLModel, table=True):
    __tablename__ = "historia_ocupacional_vo"

    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones_ocupacionales.id", index=True)

    empresa: Optional[str] = None
    cargo_funciones: Optional[str] = None
    tiempo_duracion: Optional[str] = None
    motivo_retiro: Optional[str] = None
    orden: int = Field(default=0)


# ── Sección 4: Descripción Actividad Laboral Actual ──────────────────
class ActividadActualVO(SQLModel, table=True):
    __tablename__ = "actividad_actual_vo"

    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones_ocupacionales.id", index=True)

    nombre_cargo: Optional[str] = None
    tareas_descripcion: Optional[str] = None
    herramientas_trabajo: Optional[str] = None
    horario_trabajo: Optional[str] = None
    elementos_proteccion: Optional[str] = None
    antiguedad_cargo: Optional[str] = None
    requerimientos_motrices: Optional[str] = None
    ocurrencia_atel_puesto: Optional[bool] = None
    ocurrencia_atel_area: Optional[bool] = None
    ocurrencia_atel_otro: Optional[str] = None


# ── Sección 5: Rol Laboral ───────────────────────────────────────────
class RolLaboralVO(SQLModel, table=True):
    __tablename__ = "rol_laboral_vo"

    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones_ocupacionales.id", index=True)

    tareas_operaciones: Optional[str] = None
    componentes_desempeno: Optional[str] = None
    tiempo_ejecucion: Optional[str] = None
    forma_integracion: Optional[str] = None


# ── Sección 6: Información Evento ATEL ───────────────────────────────
class EventoATELVO(SQLModel, table=True):
    __tablename__ = "evento_atel_rhb_vo"

    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones_ocupacionales.id", index=True)

    tratamiento_rehabilitacion: Optional[str] = None
    adaptaciones_recibidas: Optional[str] = None     # JSON format
    calificacion_pcl_si: Optional[bool] = None
    calificacion_pcl_porcentaje: Optional[str] = None
    calificacion_pcl_no: Optional[bool] = None


# ── Sección 7: Composición Familiar ──────────────────────────────────
class ComposicionFamiliarVO(SQLModel, table=True):
    __tablename__ = "composicion_familiar_vo"

    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones_ocupacionales.id", index=True)

    personas_sostienen_hogar: Optional[str] = None
    ingreso_promedio: Optional[str] = None
    convivencia_actual: Optional[str] = None


class MiembroFamiliarVO(SQLModel, table=True):
    __tablename__ = "miembros_familiares_vo"

    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones_ocupacionales.id", index=True)

    composicion_nucleo: Optional[str] = None
    fecha_nacimiento: Optional[str] = None
    orden: int = Field(default=0)


# ── Sección 8: Evaluación Otras Áreas Ocupacionales ──────────────────
class EvaluacionOtrasAreasVO(SQLModel, table=True):
    __tablename__ = "evaluacion_otras_areas_vo"

    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones_ocupacionales.id", index=True)

    # Las respuestas de la matriz se guardarán serializadas como JSON
    cuidado_personal: Optional[str] = None
    comunicacion: Optional[str] = None
    movilidad: Optional[str] = None
    aprendizaje_sensopercepcion: Optional[str] = None
    vida_domestica: Optional[str] = None


# ── Sección N: Registro / Firmas ────────────────────────────────────
class RegistroVO(SQLModel, table=True):
    __tablename__ = "registro_vo"

    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones_ocupacionales.id", index=True)

    nombre_elaboro: Optional[str] = None
    firma_elaboro: Optional[str] = None           # ruta o base64
    licencia_so_elaboro: Optional[str] = None
    nombre_trabajador: Optional[str] = None
    firma_trabajador: Optional[str] = None         # ruta o base64

    # Nuevos campos solicitados: Concepto, Orientación y Firmas extendidas
    concepto_ocupacional: Optional[str] = None
    orientacion_ocupacional: Optional[str] = None
    
    nombre_proveedor: Optional[str] = None
    firma_proveedor: Optional[str] = None
    
    nombre_equipo_rhb: Optional[str] = None
    firma_equipo_rhb: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
