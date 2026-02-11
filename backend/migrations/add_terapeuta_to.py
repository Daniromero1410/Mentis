"""
Migración: Agregar rol terapeuta_ocupacional, campo acceso_formatos_to,
y tablas del módulo Prueba de Trabajo TO.

Ejecutar conectándose a la BD directamente o con psql:
    psql -U william_admin -d william_romero -f migrations/add_terapeuta_to.sql

Si usa SQLModel create_db_and_tables(), las tablas se crean automáticamente.
Este script solo es necesario para:
1. Alterar el enum existente (si la BD ya tiene datos)
2. Agregar la columna acceso_formatos_to a la tabla usuarios existente
"""

SQL = """
-- 1. Agregar valor al enum RolUsuario (si aplica)
-- PostgreSQL: ALTER TYPE no soporta IF NOT EXISTS para valores
DO $$
BEGIN
    ALTER TYPE rolusuario ADD VALUE IF NOT EXISTS 'terapeuta_ocupacional';
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Valor ya existe o tipo no encontrado, continuando...';
END $$;

-- 2. Agregar columna acceso_formatos_to a usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS acceso_formatos_to BOOLEAN DEFAULT FALSE;

-- Las tablas nuevas se crean automáticamente con SQLModel.metadata.create_all()
-- al iniciar el backend (create_db_and_tables en main.py on_startup).
"""

if __name__ == "__main__":
    print("SQL para ejecutar manualmente en PostgreSQL:")
    print(SQL)
    print("\nNota: Las tablas del módulo TO se crean automáticamente al iniciar el backend.")
