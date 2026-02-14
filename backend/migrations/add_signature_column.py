import sys
import os
from sqlalchemy import text

# Add the parent directory to sys.path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.config import settings

# Use settings from config
DATABASE_URL = settings.DATABASE_URL

engine = create_engine(DATABASE_URL)

def migrate():
    print("Starting migration...")
    try:
        with engine.connect() as connection:
            # Check if column exists (PostgreSQL specific check, but fallback to Try/Catch for generic)
            try:
                # Attempt to add the column. If it exists, it might fail or we can catch it.
                # Standard SQL
                connection.execute(text("ALTER TABLE registro_to ADD COLUMN firma_trabajador TEXT;"))
                connection.commit()
                print("Migration successful: Added firma_trabajador column.")
            except Exception as e:
                # If error is "duplicate column", it's fine.
                if "duplicate column" in str(e) or "already exists" in str(e):
                    print("Column firma_trabajador already exists.")
                else:
                    print(f"Error executing alter table: {e}")
                    # For some DBs (like SQLite), ALTER TABLE might be limited, but ADD COLUMN is usually supported.
                    
    except Exception as e:
        print(f"Migration failed at connection level: {e}")

if __name__ == "__main__":
    migrate()
