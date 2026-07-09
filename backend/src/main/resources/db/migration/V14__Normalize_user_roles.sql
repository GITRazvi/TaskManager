-- File responsibility: Normalizes legacy role values and constrains users to supported application roles.
UPDATE users
SET role = 'ADMIN'
WHERE role = 'PROJECT_CREATOR';

UPDATE users
SET role = 'DEVELOPER'
WHERE role IS NULL OR role NOT IN ('ADMIN', 'PROJECT_MANAGER', 'DEVELOPER');

ALTER TABLE users
    ALTER COLUMN role SET DEFAULT 'DEVELOPER';
