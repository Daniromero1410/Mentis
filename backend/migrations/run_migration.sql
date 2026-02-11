DO $$
BEGIN
    ALTER TYPE rolusuario ADD VALUE IF NOT EXISTS 'terapeuta_ocupacional';
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Valor ya existe, continuando...';
END $$;

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS acceso_formatos_to BOOLEAN DEFAULT FALSE;

UPDATE usuarios SET acceso_formatos_to = TRUE WHERE rol = 'admin';
