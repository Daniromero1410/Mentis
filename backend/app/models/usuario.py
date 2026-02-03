from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from enum import Enum

if TYPE_CHECKING:
    from app.models.valoracion import Valoracion

class RolUsuario(str, Enum):
    ADMIN = "admin"
    SUPERVISOR = "supervisor"
    PSICOLOGO = "psicologo"

class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    nombre: str
    apellido: str
    rol: RolUsuario = Field(default=RolUsuario.PSICOLOGO)
    activo: bool = Field(default=True)
    hashed_password: str
    # Permisos de acceso a módulos
    acceso_valoraciones: bool = Field(default=True)
    acceso_pruebas_trabajo: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    valoraciones: List["Valoracion"] = Relationship(back_populates="creado_por_usuario")

class UsuarioCreate(SQLModel):
    email: str
    nombre: str
    apellido: str
    rol: RolUsuario = RolUsuario.PSICOLOGO
    password: str
    acceso_valoraciones: bool = True
    acceso_pruebas_trabajo: bool = True

class UsuarioUpdate(SQLModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    rol: Optional[RolUsuario] = None
    activo: Optional[bool] = None
    password: Optional[str] = None  # Solo si se quiere cambiar
    acceso_valoraciones: Optional[bool] = None
    acceso_pruebas_trabajo: Optional[bool] = None

class UsuarioRead(SQLModel):
    id: int
    email: str
    nombre: str
    apellido: str
    rol: RolUsuario
    activo: bool
    acceso_valoraciones: bool
    acceso_pruebas_trabajo: bool
    created_at: datetime

class UsuarioLogin(SQLModel):
    email: str
    password: str