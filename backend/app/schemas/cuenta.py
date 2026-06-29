"""
Schemas Pydantic para el módulo de Cuentas.

IMPORTANTE: el terapeuta nunca debe ver los precios. Por eso existen dos
schemas de lectura distintos: uno para el terapeuta (sin precio) y otro para
el administrador (con precio + datos de quién lo registró).
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


# ── Servicio: lo que crea/edita el terapeuta (SIN precio) ────────────
class ServicioCuentaCreate(BaseModel):
    nombre_usuario: Optional[str] = None
    tipo_documento: Optional[str] = None
    numero_documento: Optional[str] = None
    arl: Optional[str] = None
    servicio: Optional[str] = None
    cups: Optional[str] = None
    numero_autorizacion: Optional[str] = None
    fecha_realizacion: Optional[date] = None
    fecha_autorizacion: Optional[date] = None
    carpeta_cargue: Optional[str] = None
    cantidad: Optional[int] = 1
    recomendaciones: Optional[str] = None
    en_pleno: Optional[str] = None
    pcl: Optional[str] = None

    class Config:
        from_attributes = True


class ServicioCuentaUpdate(ServicioCuentaCreate):
    pass


# ── Servicio: respuesta al TERAPEUTA (sin precio) ────────────────────
class ServicioCuentaTerapeutaRead(ServicioCuentaCreate):
    id: int
    periodo_mes: int
    periodo_anio: int

    class Config:
        from_attributes = True


# ── Servicio: respuesta al ADMIN (con precio y datos del terapeuta) ──
class ServicioCuentaAdminRead(ServicioCuentaCreate):
    id: int
    terapeuta_id: int
    terapeuta_nombre: Optional[str] = None
    periodo_mes: int
    periodo_anio: int
    precio_unitario: Optional[float] = None
    viaticos: Optional[float] = None
    nota_admin: Optional[str] = None
    total: Optional[float] = None          # cantidad * precio_unitario
    permite_viaticos: Optional[bool] = False  # si el servicio admite viáticos

    class Config:
        from_attributes = True


# ── Admin asigna precio / viáticos / nota a un servicio ──────────────
class PrecioUpdate(BaseModel):
    precio_unitario: Optional[float] = None
    viaticos: Optional[float] = None
    nota_admin: Optional[str] = None


# ── Cierre mensual ───────────────────────────────────────────────────
class CierreRead(BaseModel):
    id: int
    terapeuta_id: int
    terapeuta_nombre: Optional[str] = None
    periodo_mes: int
    periodo_anio: int
    estado: str
    fecha_cierre: Optional[datetime] = None
    total_servicios: Optional[int] = None

    class Config:
        from_attributes = True


# ── Tarifas (catálogo del admin) ─────────────────────────────────────
class TarifaCreate(BaseModel):
    arl: str
    servicio: str
    precio_unitario: float = 0


class TarifaRead(TarifaCreate):
    id: int

    class Config:
        from_attributes = True


# ── Catálogo de servicios ────────────────────────────────────────────
class CatalogoServicioCreate(BaseModel):
    nombre: str
    cups: Optional[str] = None
    activo: bool = True
    orden: int = 0
    permite_viaticos: bool = False


class CatalogoServicioUpdate(BaseModel):
    nombre: Optional[str] = None
    cups: Optional[str] = None
    activo: Optional[bool] = None
    orden: Optional[int] = None
    permite_viaticos: Optional[bool] = None


class CatalogoServicioRead(BaseModel):
    id: int
    nombre: str
    cups: Optional[str] = None
    activo: bool
    orden: int
    permite_viaticos: bool = False

    class Config:
        from_attributes = True


# ── Notificaciones ───────────────────────────────────────────────────
class NotificacionRead(BaseModel):
    id: int
    tipo: Optional[str] = None
    titulo: Optional[str] = None
    mensaje: Optional[str] = None
    link: Optional[str] = None
    leida: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Respuestas agrupadas ─────────────────────────────────────────────
class TotalesPorArl(BaseModel):
    arl: str
    total_servicios: int
    valor_bruto: float                   # suma de cantidad*precio
    retefuente: float                    # lo que se descuenta = valor_bruto * 0.12
    valor_posterior_retefuente: float    # lo que queda = valor_bruto - retefuente
    viaticos: float = 0                  # suma de viáticos
    pago_70: float                       # valor_posterior_retefuente * 0.70
    total_a_pagar: float = 0             # pago_70 + viáticos


class ConsolidadoAdminResponse(BaseModel):
    servicios: List[ServicioCuentaAdminRead]
    totales_por_arl: List[TotalesPorArl]
    valor_bruto_total: float
    retefuente_total: float
    valor_posterior_retefuente_total: float
    viaticos_total: float = 0
    pago_70_total: float
    total_a_pagar_total: float = 0
