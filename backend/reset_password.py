"""
Script para resetear la contraseña de un usuario
Usa bcrypt directamente para evitar problemas de compatibilidad
"""
import bcrypt
from sqlmodel import Session, select
from app.database.connection import engine
from app.models.usuario import Usuario

def reset_password(email: str, new_password: str):
    with Session(engine) as session:
        statement = select(Usuario).where(Usuario.email == email)
        user = session.exec(statement).first()
        
        if not user:
            print(f"❌ Usuario con email '{email}' no encontrado")
            return
        
        # Generar nuevo hash con bcrypt directamente
        password_bytes = new_password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        
        user.hashed_password = hashed.decode('utf-8')
        session.add(user)
        session.commit()
        
        print(f"✅ Contraseña de '{email}' reseteada a: {new_password}")

if __name__ == "__main__":
    reset_password(
        email="danielromero.software@gmail.com",
        new_password="password123"
    )
