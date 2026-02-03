from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List
from datetime import datetime
from app.database.connection import get_session
from app.models.usuario import Usuario, UsuarioCreate, UsuarioRead, UsuarioUpdate, RolUsuario
from app.services.auth import get_current_admin, get_current_user, get_password_hash

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.get("/", response_model=List[UsuarioRead])
def listar_usuarios(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_admin)
):
    """Lista todos los usuarios (solo admin)"""
    query = select(Usuario).offset(skip).limit(limit).order_by(Usuario.nombre)
    usuarios = session.exec(query).all()
    return usuarios

@router.post("/", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
def crear_usuario(
    usuario: UsuarioCreate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_admin)
):
    """Crea un nuevo usuario (solo admin)"""
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
        hashed_password=hashed_password,
        acceso_valoraciones=usuario.acceso_valoraciones,
        acceso_pruebas_trabajo=usuario.acceso_pruebas_trabajo
    )
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    return db_user

@router.get("/{usuario_id}", response_model=UsuarioRead)
def obtener_usuario(
    usuario_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_admin)
):
    """Obtiene un usuario por ID (solo admin)"""
    usuario = session.get(Usuario, usuario_id)
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    return usuario

@router.put("/{usuario_id}", response_model=UsuarioRead)
def actualizar_usuario(
    usuario_id: int,
    datos: UsuarioUpdate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_admin)
):
    """Actualiza un usuario (solo admin)"""
    usuario = session.get(Usuario, usuario_id)
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Actualizar campos si se proporcionan
    if datos.nombre is not None:
        usuario.nombre = datos.nombre
    if datos.apellido is not None:
        usuario.apellido = datos.apellido
    if datos.rol is not None:
        usuario.rol = datos.rol
    if datos.activo is not None:
        usuario.activo = datos.activo
    if datos.acceso_valoraciones is not None:
        usuario.acceso_valoraciones = datos.acceso_valoraciones
    if datos.acceso_pruebas_trabajo is not None:
        usuario.acceso_pruebas_trabajo = datos.acceso_pruebas_trabajo
    if datos.password is not None and datos.password.strip():
        usuario.hashed_password = get_password_hash(datos.password)
    
    usuario.updated_at = datetime.utcnow()
    
    session.commit()
    session.refresh(usuario)
    
    return usuario

@router.delete("/{usuario_id}")
def eliminar_usuario(
    usuario_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_admin)
):
    """Elimina un usuario (solo admin)"""
    usuario = session.get(Usuario, usuario_id)
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    if usuario.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puede eliminarse a sí mismo"
        )
    
    session.delete(usuario)
    session.commit()
    
    return {"message": "Usuario eliminado correctamente"}

@router.put("/me", response_model=UsuarioRead)
def actualizar_mi_perfil(
    datos: UsuarioUpdate,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """Permite al usuario actualizar su propio perfil"""
    # Recargar usuario para asegurar estado actual
    usuario = session.get(Usuario, current_user.id)
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Solo permitir actualizar nombre, apellido y password
    if datos.nombre is not None:
        usuario.nombre = datos.nombre
    if datos.apellido is not None:
        usuario.apellido = datos.apellido
        
    # Cambio de contraseña si se proporciona
    if datos.password is not None and datos.password.strip():
        usuario.hashed_password = get_password_hash(datos.password)
    
    # Ignorar explícitamente rol, email y permisos (seguridad)
    # No se actualizan campos sensibles aquí
    
    usuario.updated_at = datetime.utcnow()
    
    session.commit()
    session.refresh(usuario)
    return usuario