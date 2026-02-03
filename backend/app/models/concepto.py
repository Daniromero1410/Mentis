from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from app.models.valoracion import Valoracion

class ConceptoFinal(SQLModel, table=True):
    __tablename__ = "conceptos_final"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    valoracion_id: int = Field(foreign_key="valoraciones.id", unique=True)
    concepto_generado: Optional[str] = None
    concepto_editado: Optional[str] = None
    orientacion_reintegro: Optional[str] = None
    elaboro_nombre: Optional[str] = None
    elaboro_firma: Optional[str] = None
    reviso_nombre: Optional[str] = None
    reviso_firma: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    valoracion: Optional["Valoracion"] = Relationship(back_populates="concepto")