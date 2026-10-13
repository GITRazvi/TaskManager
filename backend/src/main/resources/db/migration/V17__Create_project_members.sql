-- File responsibility: Stores project-scoped membership and roles.
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'DEVELOPER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_project_members_project_user UNIQUE (project_id, user_id)
);

INSERT INTO project_members (project_id, user_id, role)
SELECT id, user_id, 'PROJECT_MANAGER'
FROM projects
ON CONFLICT (project_id, user_id) DO UPDATE SET role = 'PROJECT_MANAGER';

INSERT INTO project_members (project_id, user_id, role)
SELECT DISTINCT sprints.project_id, sprint_members.user_id, 'DEVELOPER'
FROM sprints
JOIN sprint_members ON sprint_members.sprint_id = sprints.id
WHERE sprint_members.user_id <> sprints.user_id
ON CONFLICT (project_id, user_id) DO NOTHING;

ALTER TABLE users
    ALTER COLUMN role DROP NOT NULL,
    ALTER COLUMN role DROP DEFAULT;

UPDATE users
SET role = NULL;

CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_project_members_project_role ON project_members(project_id, role);
