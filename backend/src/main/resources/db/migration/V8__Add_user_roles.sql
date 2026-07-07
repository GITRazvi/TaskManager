-- File responsibility: Adds a default application role to users for future role-based permissions.
ALTER TABLE users
    ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'DEVELOPER';

UPDATE users
SET role = 'PROJECT_CREATOR'
WHERE email = 'admin@admin.com';
