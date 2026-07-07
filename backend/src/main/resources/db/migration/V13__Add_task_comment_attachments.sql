ALTER TABLE task_comments
    ADD COLUMN attachment_file_name VARCHAR(255),
    ADD COLUMN attachment_content_type VARCHAR(255),
    ADD COLUMN attachment_size BIGINT,
    ADD COLUMN attachment_data BYTEA;
