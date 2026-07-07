// File responsibility: Provides persistence operations for task comments.
package com.taskmanager.repository;

import com.taskmanager.entity.TaskComment;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskCommentRepository extends JpaRepository<TaskComment, UUID> {
    Optional<TaskComment> findByIdAndTaskId(UUID id, UUID taskId);
}
