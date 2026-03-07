import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import text
from app.database.connection import engine

def apply_migration():
    commands = [
        "ALTER TABLE identificacion_vo ADD COLUMN IF NOT EXISTS eventos_no_laborales VARCHAR;",
        "ALTER TABLE identificacion_vo ADD COLUMN IF NOT EXISTS eventos_no_laborales_fecha VARCHAR;",
        "ALTER TABLE identificacion_vo ADD COLUMN IF NOT EXISTS eventos_no_laborales_diagnostico VARCHAR;"
    ]
    try:
        with engine.begin() as connection:
            for cmd in commands:
                print(f"Executing: {cmd}")
                connection.execute(text(cmd))
            print("Successfully added columns to identificacion_vo.")
    except Exception as e:
        print(f"Error during manual migration: {e}")

if __name__ == '__main__':
    apply_migration()
