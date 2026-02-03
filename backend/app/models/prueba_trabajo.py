"""
Modelos para el módulo de Prueba de Trabajo
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


class EstadoPrueba(str, Enum):
    """Estados posibles de una prueba de trabajo"""
    BORRADOR = "borrador"
    COMPLETADA = "completada"


class DimensionRiesgo(str, Enum):
    """Dimensiones de riesgo psicosocial en prueba de trabajo"""
    DEMANDAS_CUANTITATIVAS = "demandas_cuantitativas"
    DEMANDAS_CARGA_MENTAL = "demandas_carga_mental"
    DEMANDAS_EMOCIONALES = "demandas_emocionales"
    EXIGENCIAS_RESPONSABILIDAD = "exigencias_responsabilidad"
    CONSISTENCIA_ROL = "consistencia_rol"
    DEMANDAS_AMBIENTALES = "demandas_ambientales"
    DEMANDAS_JORNADA = "demandas_jornada"


class NivelRiesgo(str, Enum):
    """Niveles de riesgo según ponderación"""
    RIESGO_MUY_ALTO = "riesgo_muy_alto"
    RIESGO_ALTO = "riesgo_alto"
    RIESGO_MEDIO = "riesgo_medio"
    RIESGO_BAJO = "riesgo_bajo"
    SIN_RIESGO = "sin_riesgo"


# ===== MODELO PRINCIPAL =====
class PruebaTrabajo(SQLModel, table=True):
    """Modelo principal de Prueba de Trabajo"""
    __tablename__ = "pruebas_trabajo"

    id: Optional[int] = Field(default=None, primary_key=True)

    # Control y estado
    estado: EstadoPrueba = Field(default=EstadoPrueba.BORRADOR)
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_actualizacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_finalizacion: Optional[datetime] = None

    # Usuario que creó la prueba
    creado_por: int = Field(foreign_key="usuarios.id")

    # Relaciones
    datos_empresa: Optional["DatosEmpresaPrueba"] = Relationship(back_populates="prueba")
    trabajador: Optional["TrabajadorPrueba"] = Relationship(back_populates="prueba")
    evaluador: Optional["DatosEvaluador"] = Relationship(back_populates="prueba")
    secciones: Optional["SeccionesPrueba"] = Relationship(back_populates="prueba")
    condiciones_riesgo: List["CondicionRiesgoPrueba"] = Relationship(back_populates="prueba")
    resumen_factores: List["ResumenFactorPrueba"] = Relationship(back_populates="prueba")
    concepto_final: Optional["ConceptoFinalPrueba"] = Relationship(back_populates="prueba")


# ===== DATOS DE LA EMPRESA =====
class DatosEmpresaPrueba(SQLModel, table=True):
    """Datos de la empresa en la prueba de trabajo"""
    __tablename__ = "datos_empresa_prueba"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="pruebas_trabajo.id", unique=True)

    # Campos del formulario
    empresa: Optional[str] = None
    tipo_documento: Optional[str] = None
    nit: Optional[str] = None
    persona_contacto: Optional[str] = None
    email_notificaciones: Optional[str] = None
    direccion: Optional[str] = None
    arl: Optional[str] = None
    ciudad: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    prueba: Optional["PruebaTrabajo"] = Relationship(back_populates="datos_empresa")


# ===== DATOS DEL TRABAJADOR =====
class TrabajadorPrueba(SQLModel, table=True):
    """Datos del trabajador evaluado"""
    __tablename__ = "trabajadores_prueba"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="pruebas_trabajo.id", unique=True)

    # Identificación
    nombre: Optional[str] = None
    identificacion: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    edad: Optional[int] = None
    genero: Optional[str] = None

    # Educación y salud
    escolaridad: Optional[str] = None
    nivel_educativo: Optional[str] = None
    eps: Optional[str] = None

    # Información laboral
    puesto_trabajo_evaluado: Optional[str] = None
    cargo: Optional[str] = None
    area: Optional[str] = None
    fecha_ingreso_empresa: Optional[date] = None
    fecha_ingreso_puesto_evaluado: Optional[date] = None
    antiguedad_empresa: Optional[str] = None  # Ej: "2 años 3 meses"
    antiguedad_puesto_evaluado: Optional[str] = None
    antiguedad_cargo: Optional[str] = None

    # Información médica
    diagnostico: Optional[str] = None
    codigo_cie10: Optional[str] = None
    fecha_siniestro: Optional[date] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    prueba: Optional["PruebaTrabajo"] = Relationship(back_populates="trabajador")


# ===== DATOS DEL EVALUADOR =====
class DatosEvaluador(SQLModel, table=True):
    """Datos del profesional que realiza la evaluación"""
    __tablename__ = "datos_evaluador"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="pruebas_trabajo.id", unique=True)

    nombre: Optional[str] = None
    identificacion: Optional[str] = None
    formacion: Optional[str] = None
    tarjeta_profesional: Optional[str] = None
    licencia_sst: Optional[str] = None
    fecha_evaluacion: Optional[date] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    prueba: Optional["PruebaTrabajo"] = Relationship(back_populates="evaluador")


# ===== SECCIONES DE TEXTO LIBRE =====
class SeccionesPrueba(SQLModel, table=True):
    """Secciones de texto libre del formulario"""
    __tablename__ = "secciones_prueba"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="pruebas_trabajo.id", unique=True)

    # Secciones de texto libre
    metodologia: Optional[str] = None
    revision_documental: Optional[str] = None
    descripcion_puesto: Optional[str] = None
    condicion_actual: Optional[str] = None
    descripcion_funciones: Optional[str] = None

    # Participantes
    participante_trabajador: Optional[str] = None
    participante_jefe: Optional[str] = None
    participante_cargo_jefe: Optional[str] = None

    # Fuentes de recolección de información
    fuente_trabajador_fecha: Optional[date] = None
    fuente_jefe_fecha: Optional[date] = None
    fuente_par_fecha: Optional[date] = None

    # Aspectos Ocupacionales
    nombre_puesto: Optional[str] = None
    area_puesto: Optional[str] = None
    antiguedad_cargo_ocupacional: Optional[str] = None
    antiguedad_empresa_ocupacional: Optional[str] = None
    nivel_educativo_requerido: Optional[str] = None
    jornada_laboral: Optional[str] = None
    horas_extras: Optional[str] = None
    turnos: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    prueba: Optional["PruebaTrabajo"] = Relationship(back_populates="secciones")


# ===== CONDICIONES DE RIESGO (FR/EXP/INT) =====
class CondicionRiesgoPrueba(SQLModel, table=True):
    """Cada condición evaluada con FR, EXP, INT"""
    __tablename__ = "condiciones_riesgo_prueba"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="pruebas_trabajo.id")

    # Clasificación
    dimension: DimensionRiesgo
    item_numero: int  # Número del ítem dentro de la dimensión
    condicion_texto: str  # Texto descriptivo de la condición (ej: "Ritmo de trabajo acelerado")

    # Descripción detallada del experto
    descripcion_detallada: Optional[str] = None  # La explicación completa del factor

    # Calificaciones (0-7 cada una)
    frecuencia: Optional[int] = Field(default=None, ge=0, le=7)
    exposicion: Optional[int] = Field(default=None, ge=0, le=7)
    intensidad: Optional[int] = Field(default=None, ge=0, le=7)

    # Suma horizontal (0-21)
    total_condicion: Optional[int] = Field(default=None, ge=0, le=21)

    # Fuentes de información utilizadas
    fuentes_informacion: Optional[str] = Field(default="Entrevista con el trabajador y jefe inmediato")

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    prueba: Optional["PruebaTrabajo"] = Relationship(back_populates="condiciones_riesgo")


# ===== RESUMEN DE FACTORES =====
class ResumenFactorPrueba(SQLModel, table=True):
    """Resumen de factores de riesgo por dimensión"""
    __tablename__ = "resumen_factores_prueba"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="pruebas_trabajo.id")

    # Dimensión evaluada
    dimension: DimensionRiesgo

    # Número total de ítems en esta dimensión
    num_items: int

    # Puntuación total de la dimensión (suma vertical)
    puntuacion_total: Optional[int] = None

    # Nivel de riesgo calculado según ponderación
    nivel_riesgo_trabajador: Optional[NivelRiesgo] = None  # Valoración subjetiva del trabajador
    nivel_riesgo_experto: Optional[NivelRiesgo] = None     # Valoración del experto

    # Factores detectados (texto descriptivo)
    factores_detectados_trabajador: Optional[str] = None  # Lista de factores reportados por trabajador
    factores_detectados_experto: Optional[str] = None     # Lista de factores detectados por experto

    # Observaciones del experto
    observaciones_experto: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    prueba: Optional["PruebaTrabajo"] = Relationship(back_populates="resumen_factores")


# ===== CONCEPTO FINAL =====
class ConceptoFinalPrueba(SQLModel, table=True):
    """Concepto psicológico final y conclusiones"""
    __tablename__ = "concepto_final_prueba"

    id: Optional[int] = Field(default=None, primary_key=True)
    prueba_id: int = Field(foreign_key="pruebas_trabajo.id", unique=True)

    # Conclusión de la evaluación (concordancia entre trabajador y experto)
    conclusion_evaluacion: Optional[str] = None
    concordancia_items: Optional[str] = None  # Items donde hay concordancia
    no_concordancia_items: Optional[str] = None  # Items donde no hay concordancia

    # Conclusiones finales de la prueba de trabajo de esfera mental
    # Este campo será generado por el modelo de ML
    concepto_generado_ml: Optional[str] = None

    # Permitir edición manual del concepto
    conclusiones_finales: Optional[str] = None  # El texto final de conclusiones

    # Recomendaciones adicionales
    recomendaciones: Optional[str] = None

    # Firma del evaluador (imagen)
    firma_evaluador: Optional[str] = None  # Path a la imagen de firma

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    prueba: Optional["PruebaTrabajo"] = Relationship(back_populates="concepto_final")
