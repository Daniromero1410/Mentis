"""
Modelos SQLModel para el módulo de Cuentas (relación de servicios mensuales).

Flujo:
- El terapeuta registra los servicios prestados durante el mes (sin precios).
- Al terminar, "cierra" el mes -> se notifica al administrador.
- El administrador ve el consolidado de todos los terapeutas, asigna precios
  (apoyado en un catálogo de tarifas ARL+servicio) y calcula los totales.
"""
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date
from enum import Enum


class EstadoCierre(str, Enum):
    ABIERTO = "abierto"       # el terapeuta aún edita
    CERRADO = "cerrado"       # el terapeuta cerró el mes, pendiente de revisión
    REVISADO = "revisado"     # el admin ya revisó / liquidó


# ── Servicio individual registrado por un terapeuta ──────────────────
class ServicioCuenta(SQLModel, table=True):
    __tablename__ = "servicios_cuenta"

    id: Optional[int] = Field(default=None, primary_key=True)
    terapeuta_id: int = Field(foreign_key="usuarios.id", index=True)

    # Periodo (mensual)
    periodo_mes: int = Field(index=True)   # 1-12
    periodo_anio: int = Field(index=True)  # ej. 2026

    # Datos del servicio (estructura de la relación que arma el terapeuta)
    nombre_usuario: Optional[str] = None
    tipo_documento: Optional[str] = None
    numero_documento: Optional[str] = None
    arl: Optional[str] = None
    servicio: Optional[str] = None
    numero_autorizacion: Optional[str] = None
    fecha_realizacion: Optional[date] = None
    fecha_autorizacion: Optional[date] = None
    carpeta_cargue: Optional[str] = None
    cantidad: Optional[int] = Field(default=1)

    # Columnas clínicas opcionales
    recomendaciones: Optional[str] = None
    en_pleno: Optional[str] = None
    pcl: Optional[str] = None

    # ── Campos SOLO visibles/editables por el administrador ──────────
    precio_unitario: Optional[float] = None   # lo asigna el admin
    nota_admin: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Cierre mensual por terapeuta ─────────────────────────────────────
class CierreMensual(SQLModel, table=True):
    __tablename__ = "cierres_mensuales"

    id: Optional[int] = Field(default=None, primary_key=True)
    terapeuta_id: int = Field(foreign_key="usuarios.id", index=True)
    periodo_mes: int = Field(index=True)
    periodo_anio: int = Field(index=True)

    estado: str = Field(default=EstadoCierre.ABIERTO.value)
    fecha_cierre: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Catálogo de tarifas (ARL + servicio -> precio) ───────────────────
class TarifaCuenta(SQLModel, table=True):
    __tablename__ = "tarifas_cuenta"

    id: Optional[int] = Field(default=None, primary_key=True)
    arl: str = Field(index=True)
    servicio: str = Field(index=True)
    precio_unitario: float = Field(default=0)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Catálogo de servicios (editable por el admin) ────────────────────
class CatalogoServicio(SQLModel, table=True):
    __tablename__ = "catalogo_servicios"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    activo: bool = Field(default=True)
    orden: int = Field(default=0)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Notificaciones (genérico, reutilizable) ──────────────────────────
class Notificacion(SQLModel, table=True):
    __tablename__ = "notificaciones"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_destino_id: int = Field(foreign_key="usuarios.id", index=True)
    tipo: Optional[str] = None          # ej. "cierre_mensual"
    titulo: Optional[str] = None
    mensaje: Optional[str] = None
    link: Optional[str] = None
    leida: bool = Field(default=False, index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
