// File responsibility: Provides Spring Data queries for project ownership checks and listing.
package com.taskmanager.repository;

import com.taskmanager.entity.Project;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Project> findByIdAndUserId(UUID id, UUID userId);
}
