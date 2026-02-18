import sys
import os
from sqlalchemy import text

# Add parent directory to path
sys.path.append(os.getcwd())

from app.database.connection import engine

def add_column():
    print("Adding 'laborales' column to perfil_exigencias_ae...")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE perfil_exigencias_ae ADD COLUMN IF NOT EXISTS laborales JSON;"))
            conn.commit()
            print("Column 'laborales' added successfully.")
        except Exception as e:
            print(f"Error adding column: {e}")

if __name__ == "__main__":
    add_column()
