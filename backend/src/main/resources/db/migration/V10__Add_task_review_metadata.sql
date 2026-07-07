-- File responsibility: Adds review, estimation, and comment metadata to task records.
ALTER TABLE tasks
    ADD COLUMN reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN story_points INTEGER CHECK (story_points IS NULL OR story_points >= 0),
    ADD COLUMN comments TEXT;

CREATE INDEX idx_tasks_reviewer ON tasks(reviewer_id);
