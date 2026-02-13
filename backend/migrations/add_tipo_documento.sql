-- Ejecutar este script para agregar la columna tipo_documento a la tabla identificacion_to
-- Esto es necesario para evitar errores al guardar el formulario actualizado.

DO $$
BEGIN
    ALTER TABLE identificacion_to ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error al agregar columna, verifique si ya existe.';
END $$;
