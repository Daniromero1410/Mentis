from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from enum import Enum

if TYPE_CHECKING:
    from app.models.valoracion import Valoracion

class CalificacionRiesgo(str, Enum):
    ALTO = "alto"
    MEDIO = "medio"
    BAJO = "bajo"

class CategoriaRiesgo(str, Enum):
    DEMANDAS_CUANTITATIVAS = "demandas_cuantitativas"
    DEMANDAS_CARGA_MENTAL = "demandas_carga_mental"
    DEMANDAS_EMOCIONALES = "demandas_emocionales"
    EXIGENCIAS_RESPONSABILIDAD = "exigencias_responsabilidad"
    CONSISTENCIA_ROL = "consistencia_rol"
    DEMANDAS_AMBIENTALES = "demandas_ambientales"
    DEMANDAS_JORNADA = "demandas_jornada"

class EvaluacionRiesgo(SQLModel, table=True):
    __tablename__ = "evaluaciones_riesgo"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones.id")
    categoria: CategoriaRiesgo
    item_numero: int
    item_texto: str
    calificacion: Optional[CalificacionRiesgo] = None
    observaciones: Optional[str] = None
    
    valoracion: Optional["Valoracion"] = Relationship(back_populates="evaluaciones_riesgo")


ITEMS_RIESGO_PSICOSOCIAL = {
    CategoriaRiesgo.DEMANDAS_CUANTITATIVAS: [
        "Ritmo de trabajo acelerado o bajo presión de tiempo",
        "Imposibilidad de hacer pausas dentro de la jornada",
        "Tiempo adicional para cumplir con el trabajo asignado",
        "Volumen de carga laboral",
    ],
    CategoriaRiesgo.DEMANDAS_CARGA_MENTAL: [
        "Exigencia de memoria, atención y concentración",
        "Exigencia de altos niveles de detalle o precisión",
        "Elevada cantidad de información que se usa bajo presión de tiempo",
        "Elevada cantidad de información que se usa de forma simultánea",
        "La información necesaria para realizar el trabajo es compleja",
        "Ejecución de tareas de alta carga cognitiva",
        "Cantidad de tareas que exigen realización bajo presión de tiempo",
        "Percepción de agotamiento al final de la jornada",
    ],
    CategoriaRiesgo.DEMANDAS_EMOCIONALES: [
        "Exposición a sentimientos, emociones y trato negativo de usuarios o clientes",
        "Exposición a situaciones emocionalmente devastadoras",
        "Impacto emocional de la tarea en el ámbito extralaboral",
        "Posibilidad de cometer errores que afecten el resultado de los procesos",
        "Grado de tensión sobre la realización de la tarea",
        "Percepción de monotonía o actividad repetitiva de la tarea",
    ],
    CategoriaRiesgo.EXIGENCIAS_RESPONSABILIDAD: [
        "Responsabilidad directa por la vida, salud o seguridad de otras personas",
        "Responsabilidad directa por supervisión de personal",
        "Responsabilidad directa por resultados del área de trabajo",
        "Responsabilidad directa por bienes de elevada cuantía",
        "Responsabilidad directa por dinero de la organización",
        "Responsabilidad directa por información confidencial",
    ],
    CategoriaRiesgo.CONSISTENCIA_ROL: [
        "Falta de recursos, personas o herramientas necesarias para desarrollar el trabajo",
        "Órdenes contradictorias provenientes de una o varias personas",
        "Solicitudes o requerimientos innecesarios en el trabajo",
        "Solicitudes que van en contra de principios éticos, técnicos, de seguridad o calidad",
        "Variación eventual o continua de la tarea asignada",
        "Realización de tareas simultáneas",
        "Las tareas exigen actualización de conocimientos de manera constante",
    ],
    CategoriaRiesgo.DEMANDAS_AMBIENTALES: [
        "Ruido que afecta negativamente la calidad de la tarea",
        "Iluminación que afecta negativamente la calidad de la tarea",
        "Temperatura que afecta negativamente",
        "Condiciones de ventilación que afectan negativamente la calidad de la tarea",
        "Distribución y características del puesto/equipos que afectan negativamente",
        "Condiciones de orden y aseo que afectan negativamente la calidad de la tarea",
        "Preocupación por exposición a agentes biológicos",
        "Preocupación por exposición a agentes químicos",
        "Exigencias de esfuerzo físico que afectan negativamente la calidad de la tarea",
        "Preocupación ante la posibilidad de sufrir un accidente de trabajo",
    ],
    CategoriaRiesgo.DEMANDAS_JORNADA: [
        "Trabajo en horario nocturno",
        "Días de trabajo consecutivo sin descanso",
    ],
}