-- File responsibility: Stores sprint membership for shared sprint and sprint task visibility.
CREATE TABLE sprint_members (
    sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sprint_id, user_id)
);

INSERT INTO sprint_members (sprint_id, user_id)
SELECT id, user_id
FROM sprints
ON CONFLICT DO NOTHING;

CREATE INDEX idx_sprint_members_user ON sprint_members(user_id);
