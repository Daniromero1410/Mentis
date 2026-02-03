from sqlmodel import create_engine, SQLModel, Session
from app.config import settings

# Crear el engine de conexión
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG  # Muestra las queries SQL en consola
)

def create_db_and_tables():
    """Crea todas las tablas en la base de datos"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency para obtener una sesión de base de datos"""
    with Session(engine) as session:
        yield session