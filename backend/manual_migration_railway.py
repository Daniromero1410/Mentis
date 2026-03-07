from sqlalchemy import create_engine, text

# URL proporcionada por ti para la BD de Railway
DATABASE_URL = "postgresql://postgres:yioHjzbJfMCaXoGORKHmCAGqUraAWics@interchange.proxy.rlwy.net:30267/railway"

engine = create_engine(DATABASE_URL)

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
            print("Successfully added columns to identificacion_vo in the Railway DB.")
    except Exception as e:
        print(f"Error during manual migration: {e}")

if __name__ == '__main__':
    apply_migration()
