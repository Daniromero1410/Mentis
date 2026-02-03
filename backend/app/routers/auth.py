from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import timedelta, datetime
from app.database.connection import get_session
from app.models.usuario import Usuario, UsuarioCreate, UsuarioRead, UsuarioLogin, RolUsuario
from app.models.password_reset import PasswordResetRequest, PasswordResetRequestCreate, PasswordResetRequestRead
from app.services.auth import (
    get_password_hash, 
    verify_password, 
    create_access_token,
    get_current_user,
    get_current_admin
)
from app.config import settings
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Autenticación"])

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UsuarioRead

class MessageResponse(BaseModel):
    message: str

@router.post("/registro", response_model=Token)
def registrar_usuario(
    usuario: UsuarioCreate,
    session: Session = Depends(get_session)
):
    """Registra un nuevo usuario"""
    # Verificar si el email ya existe
    statement = select(Usuario).where(Usuario.email == usuario.email)
    existing_user = session.exec(statement).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Crear el usuario
    hashed_password = get_password_hash(usuario.password)
    db_user = Usuario(
        email=usuario.email,
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        rol=usuario.rol,
        hashed_password=hashed_password
    )
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    # Crear token
    access_token = create_access_token(
        data={"sub": str(db_user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UsuarioRead.model_validate(db_user)
    )

@router.post("/login", response_model=Token)
def login(
    credentials: UsuarioLogin,
    session: Session = Depends(get_session)
):
    """Inicia sesión y devuelve un token"""
    # Buscar usuario por email
    statement = select(Usuario).where(Usuario.email == credentials.email)
    user = session.exec(statement).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario desactivado"
        )
    
    # Crear token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UsuarioRead.model_validate(user)
    )

@router.get("/me", response_model=UsuarioRead)
def get_me(current_user: Usuario = Depends(get_current_user)):
    """Obtiene el usuario actual"""
    return current_user

@router.post("/crear-admin-inicial", response_model=MessageResponse)
def crear_admin_inicial(session: Session = Depends(get_session)):
    """Crea el usuario administrador inicial (solo funciona si no hay usuarios)"""
    # Verificar si ya hay usuarios
    statement = select(Usuario)
    users = session.exec(statement).first()
    
    if users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existen usuarios en el sistema"
        )
    
    # Crear admin inicial
    admin = Usuario(
        email="danielromero.software@gmail.com",
        nombre="Administrador",
        apellido="Sistema",
        rol=RolUsuario.ADMIN,
        hashed_password=get_password_hash("admin123")
    )
    
    session.add(admin)
    session.commit()
    
    return MessageResponse(message="Administrador creado. Email: danielromero.software@gmail.com, Password: admin123")

# Password Reset Endpoints

@router.post("/password-reset-request", response_model=MessageResponse)
def request_password_reset(
    request_data: PasswordResetRequestCreate,
    session: Session = Depends(get_session)
):
    """Crea una solicitud de restablecimiento de contraseña"""
    # Verificar si el email existe
    statement = select(Usuario).where(Usuario.email == request_data.email)
    user = session.exec(statement).first()
    
    if not user:
        # Por seguridad, no decimos si el email existe o no, pero simulamos éxito
        # Opcionalmente podemos retornar error si queremos ser explícitos
        pass
        
    # Crear la solicitud
    db_request = PasswordResetRequest(email=request_data.email)
    session.add(db_request)
    session.commit()
    
    return MessageResponse(message="Solicitud recibida. Si el correo existe, el administrador será notificado.")

@router.get("/password-reset-requests", response_model=list[PasswordResetRequestRead])
def get_password_reset_requests(
    current_user: Usuario = Depends(get_current_admin),
    session: Session = Depends(get_session),
    pending_only: bool = True
):
    """Obtiene la lista de solicitudes de restablecimiento de contraseña (Solo Admin)"""
    statement = select(PasswordResetRequest)
    
    if pending_only:
        statement = statement.where(PasswordResetRequest.is_resolved == False)
        
    statement = statement.order_by(PasswordResetRequest.created_at.desc())
    requests = session.exec(statement).all()
    return requests

@router.post("/password-reset-requests/{request_id}/resolve", response_model=PasswordResetRequestRead)
def resolve_password_reset_request(
    request_id: int,
    current_user: Usuario = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    """Marca una solicitud como resuelta (Solo Admin)"""
    request = session.get(PasswordResetRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
        
    request.is_resolved = True
    request.resolved_by_id = current_user.id
    request.resolved_at = datetime.utcnow()
    
    print(f"DEBUG: Resolving request {request_id} by user {current_user.id}")
    session.add(request)
    try:
        session.commit()
        print("DEBUG: Commit successful")
    except Exception as e:
        print(f"DEBUG: Commit failed: {e}")
        raise e
        
    session.refresh(request)
    print(f"DEBUG: Request state after refresh: is_resolved={request.is_resolved}")
    return request