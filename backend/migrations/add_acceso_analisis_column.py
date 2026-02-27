import sys
import os
from sqlalchemy import text

# Add parent directory to path
sys.path.append(os.getcwd())

import os
os.environ["DATABASE_URL"] = "postgresql://postgres:yioHjzbJfMCaXoGORKHmCAGqUraAWics@interchange.proxy.rlwy.net:30267/railway"

from app.database.connection import engine

def add_column():
    print("Adding 'acceso_analisis_exigencias_mental' column to usuarios...")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS acceso_analisis_exigencias_mental BOOLEAN DEFAULT FALSE;"))
            conn.commit()
            print("Column 'acceso_analisis_exigencias_mental' added successfully.")
        except Exception as e:
            print(f"Error adding column: {e}")

if __name__ == "__main__":
    add_column()
