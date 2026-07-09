-- File responsibility: Adds append-only task status transition history with actor and timestamp metadata.
CREATE TABLE task_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO task_status_history (task_id, from_status, to_status, changed_by, created_at)
SELECT id, NULL, status, user_id, created_at
FROM tasks;

CREATE INDEX idx_task_status_history_task_created ON task_status_history(task_id, created_at);
CREATE INDEX idx_task_status_history_changed_by ON task_status_history(changed_by);
