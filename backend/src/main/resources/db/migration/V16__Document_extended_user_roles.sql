-- File responsibility: Documents the expanded supported application roles without changing existing assignments.
UPDATE users
SET role = 'DEVELOPER'
WHERE role IS NULL OR role NOT IN (
    'ADMIN',
    'PROJECT_MANAGER',
    'DEVELOPER',
    'QA_TESTER',
    'PRODUCT_OWNER',
    'SCRUM_MASTER',
    'VIEWER'
);
