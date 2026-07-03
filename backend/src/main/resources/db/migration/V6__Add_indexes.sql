-- File responsibility: Adds database indexes that speed up common user, task, sprint, and audit queries.
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_sprints_created_at ON sprints(created_at);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
