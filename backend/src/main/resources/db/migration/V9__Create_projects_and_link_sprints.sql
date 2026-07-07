-- File responsibility: Creates projects and makes every sprint belong to one project.
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_user_created ON projects(user_id, created_at);

INSERT INTO projects (id, user_id, name, description, created_at, updated_at)
SELECT gen_random_uuid(), sprint_users.user_id, 'General', 'Default project for existing sprints', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT user_id
    FROM sprints
) sprint_users;

ALTER TABLE sprints
    ADD COLUMN project_id UUID;

UPDATE sprints
SET project_id = projects.id
FROM projects
WHERE sprints.user_id = projects.user_id
  AND projects.name = 'General'
  AND projects.description = 'Default project for existing sprints';

ALTER TABLE sprints
    ALTER COLUMN project_id SET NOT NULL,
    ADD CONSTRAINT fk_sprints_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

CREATE INDEX idx_sprints_project_status ON sprints(project_id, status);
