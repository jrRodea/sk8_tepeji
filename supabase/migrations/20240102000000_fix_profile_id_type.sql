-- Fix: profiles.id debe ser text, no uuid, para usar Clerk user IDs (user_xxx)

-- 1. Eliminar foreign keys que referencian profiles(id)
ALTER TABLE spots       DROP CONSTRAINT IF EXISTS spots_added_by_fkey;
ALTER TABLE spot_photos DROP CONSTRAINT IF EXISTS spot_photos_uploaded_by_fkey;
ALTER TABLE tricks      DROP CONSTRAINT IF EXISTS tricks_posted_by_fkey;
ALTER TABLE votes       DROP CONSTRAINT IF EXISTS votes_user_id_fkey;

-- 2. Cambiar profiles.id de uuid a text
ALTER TABLE profiles ALTER COLUMN id TYPE text;

-- 3. Cambiar las columnas de referencia en las demás tablas
ALTER TABLE spots       ALTER COLUMN added_by      TYPE text;
ALTER TABLE spot_photos ALTER COLUMN uploaded_by   TYPE text;
ALTER TABLE tricks      ALTER COLUMN posted_by     TYPE text;
ALTER TABLE votes       ALTER COLUMN user_id       TYPE text;

-- 4. Restaurar foreign keys
ALTER TABLE spots       ADD CONSTRAINT spots_added_by_fkey       FOREIGN KEY (added_by)    REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE spot_photos ADD CONSTRAINT spot_photos_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE tricks      ADD CONSTRAINT tricks_posted_by_fkey     FOREIGN KEY (posted_by)   REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE votes       ADD CONSTRAINT votes_user_id_fkey        FOREIGN KEY (user_id)     REFERENCES profiles(id) ON DELETE CASCADE;
