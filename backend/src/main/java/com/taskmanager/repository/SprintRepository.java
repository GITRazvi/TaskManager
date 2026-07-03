// File responsibility: Provides Spring Data queries for sprint lookup, filtering, and ownership checks.
package com.taskmanager.repository;

import com.taskmanager.entity.Sprint;
import com.taskmanager.entity.enums.SprintStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SprintRepository extends JpaRepository<Sprint, UUID> {
    /**
     * Finds every sprint owned by {@code userId}.
     */
    List<Sprint> findAllByUserId(UUID userId);

    /**
     * Finds sprints for {@code userId} that match the provided sprint {@code status}.
     */
    List<Sprint> findAllByUserIdAndStatus(UUID userId, SprintStatus status);

    /**
     * Finds a sprint by id only when it is owned by {@code userId}, supporting service-layer authorization checks.
     */
    Optional<Sprint> findByIdAndUserId(UUID id, UUID userId);
}
