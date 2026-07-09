// File responsibility: Persists task status transition history entries.
package com.taskmanager.repository;

import com.taskmanager.entity.TaskStatusHistory;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskStatusHistoryRepository extends JpaRepository<TaskStatusHistory, UUID> {
}
