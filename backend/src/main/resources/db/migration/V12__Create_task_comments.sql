CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO task_comments (task_id, author_id, content, created_at, updated_at)
SELECT id, user_id, comments, created_at, updated_at
FROM tasks
WHERE comments IS NOT NULL AND btrim(comments) <> '';

CREATE INDEX idx_task_comments_task_created ON task_comments(task_id, created_at);
CREATE INDEX idx_task_comments_author ON task_comments(author_id);
