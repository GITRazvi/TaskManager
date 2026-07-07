-- File responsibility: Adds developer-estimated or logged implementation hours to tasks.
ALTER TABLE tasks
    ADD COLUMN estimated_hours NUMERIC(8, 2) CHECK (estimated_hours IS NULL OR estimated_hours >= 0);
