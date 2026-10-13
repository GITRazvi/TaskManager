// File responsibility: Provides Spring Data queries for project ownership checks and listing.
package com.taskmanager.repository;

import com.taskmanager.entity.Project;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Project> findByIdAndUserId(UUID id, UUID userId);

    @Query("""
            select distinct project
            from Project project
            join project.members member
            where member.user.id = :userId
            order by project.createdAt desc
            """)
    List<Project> findAllAccessibleByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);

    @Query("""
            select distinct project
            from Project project
            join project.members member
            where project.id = :id and member.user.id = :userId
            """)
    Optional<Project> findAccessibleByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}
