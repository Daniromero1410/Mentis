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

def run_column_migrations():
    """Agrega columnas nuevas a tablas existentes si aún no existen."""
    migrations = [
        ("actividad_actual_vo", "que_hacia_atel", "TEXT"),
        ("actividad_actual_vo", "relato_atel", "TEXT"),
    ]
    with engine.connect() as conn:
        for table, column, col_type in migrations:
            try:
                conn.execute(
                    __import__("sqlalchemy").text(
                        f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {col_type}"
                    )
                )
                conn.commit()
            except Exception:
                conn.rollback()

def get_session():
    """Dependency para obtener una sesión de base de datos"""
    with Session(engine) as session:
        yield session