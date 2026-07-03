-- File responsibility: Adds sprint linkage to tasks so tasks can belong to a sprint board.
ALTER TABLE tasks
    ADD COLUMN sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL;

CREATE INDEX idx_tasks_sprint_status ON tasks(sprint_id, status);
