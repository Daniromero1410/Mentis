import os
import sys

# Set the DATABASE_URL environment variable BEFORE importing app modules
os.environ["DATABASE_URL"] = "postgresql://postgres:yioHjzbJfMCaXoGORKHmCAGqUraAWics@interchange.proxy.rlwy.net:30267/railway"

# Add current directory to sys.path
sys.path.append(os.getcwd())

from sqlmodel import SQLModel, create_engine, text
from app.database.connection import engine
# Import ALL models to ensure they are registered in metadata
from app.models import usuario, prueba_trabajo, prueba_trabajo_to, analisis_exigencia, valoracion

def update_schema():
    print(f"Connecting to: {os.environ['DATABASE_URL']}")
    
    try:
        # Create all tables
        print("Creating tables...")
        SQLModel.metadata.create_all(engine)
        print("Tables created successfully.")
        
        # Verify if 'analisis_exigencia' table exists
        with engine.connect() as connection:
            result = connection.execute(text("SELECT to_regclass('public.analisis_exigencia')"))
            exists = result.scalar()
            if exists:
                print("Verification: Table 'analisis_exigencia' exists.")
            else:
                print("Verification FAILED: Table 'analisis_exigencia' does not exist.")
                
    except Exception as e:
        print(f"Error updating schema: {e}")

if __name__ == "__main__":
    update_schema()
