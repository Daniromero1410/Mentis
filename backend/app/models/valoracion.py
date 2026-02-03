from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date
from enum import Enum

if TYPE_CHECKING:
    from app.models.usuario import Usuario
    from app.models.evaluacion import EvaluacionRiesgo
    from app.models.concepto import ConceptoFinal

class EstadoValoracion(str, Enum):
    BORRADOR = "borrador"
    COMPLETADA = "completada"
    REVISADA = "revisada"

class EstadoCivil(str, Enum):
    CASADO = "casado"
    SOLTERO = "soltero"
    UNION_LIBRE = "union_libre"
    SEPARADO = "separado"
    VIUDO = "viudo"

class Zona(str, Enum):
    URBANO = "urbano"
    RURAL = "rural"

class ModalidadTrabajo(str, Enum):
    PRESENCIAL = "presencial"
    TELETRABAJO = "teletrabajo"
    TRABAJO_EN_CASA = "trabajo_en_casa"


class Valoracion(SQLModel, table=True):
    __tablename__ = "valoraciones"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    fecha_valoracion: date
    estado: EstadoValoracion = Field(default=EstadoValoracion.BORRADOR)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    creado_por: Optional[int] = Field(default=None, foreign_key="usuarios.id")
    
    creado_por_usuario: Optional["Usuario"] = Relationship(back_populates="valoraciones")
    trabajador: Optional["Trabajador"] = Relationship(back_populates="valoracion", sa_relationship_kwargs={"uselist": False})
    info_laboral: Optional["InfoLaboral"] = Relationship(back_populates="valoracion", sa_relationship_kwargs={"uselist": False})
    historia_ocupacional: List["HistoriaOcupacional"] = Relationship(back_populates="valoracion")
    actividad_laboral: Optional["ActividadLaboral"] = Relationship(back_populates="valoracion", sa_relationship_kwargs={"uselist": False})
    evaluaciones_riesgo: List["EvaluacionRiesgo"] = Relationship(back_populates="valoracion")
    concepto: Optional["ConceptoFinal"] = Relationship(back_populates="valoracion", sa_relationship_kwargs={"uselist": False})


class Trabajador(SQLModel, table=True):
    __tablename__ = "trabajadores"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones.id")
    nombre: str = Field(index=True)
    documento: str = Field(index=True)
    identificacion_siniestro: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    estado_civil: Optional[EstadoCivil] = None
    nivel_educativo: Optional[str] = None
    formacion_especifica: Optional[str] = None
    telefonos: Optional[str] = None
    direccion: Optional[str] = None
    zona: Optional[Zona] = None
    diagnostico_mental: Optional[str] = None
    
    valoracion: Optional[Valoracion] = Relationship(back_populates="trabajador")


class InfoLaboral(SQLModel, table=True):
    __tablename__ = "info_laboral"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones.id")
    fecha_evento_atel: Optional[date] = None
    eventos_no_laborales: bool = Field(default=False)
    evento_no_laboral_fecha: Optional[date] = None
    evento_no_laboral_diagnostico: Optional[str] = None
    eps: Optional[str] = None
    fondo_pension: Optional[str] = None
    dias_incapacidad: Optional[int] = None
    empresa: Optional[str] = None
    nit_empresa: Optional[str] = None
    vinculacion_laboral: bool = Field(default=True)
    tipo_vinculacion: Optional[str] = None
    modalidad: Optional[ModalidadTrabajo] = None
    tiempo_modalidad: Optional[str] = None
    fecha_ingreso_empresa: Optional[date] = None
    antiguedad_empresa_anos: Optional[int] = None
    antiguedad_empresa_meses: Optional[int] = None
    antiguedad_cargo_anos: Optional[int] = None
    antiguedad_cargo_meses: Optional[int] = None
    contacto_empresa: Optional[str] = None
    cargo_contacto: Optional[str] = None
    correos: Optional[str] = None
    telefonos_empresa: Optional[str] = None
    
    valoracion: Optional[Valoracion] = Relationship(back_populates="info_laboral")


class HistoriaOcupacional(SQLModel, table=True):
    __tablename__ = "historia_ocupacional"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones.id")
    orden: int = Field(default=1)
    empresa: Optional[str] = None
    cargo_funciones: Optional[str] = None
    duracion: Optional[str] = None
    motivo_retiro: Optional[str] = None
    
    valoracion: Optional[Valoracion] = Relationship(back_populates="historia_ocupacional")


class ActividadLaboral(SQLModel, table=True):
    __tablename__ = "actividad_laboral"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones.id")
    nombre_cargo: Optional[str] = None
    tareas: Optional[str] = None
    herramientas: Optional[str] = None
    horario: Optional[str] = None
    elementos_proteccion: Optional[str] = None
    otros_oficios: Optional[str] = None
    oficios_interes: Optional[str] = None
    
    valoracion: Optional[Valoracion] = Relationship(back_populates="actividad_laboral")