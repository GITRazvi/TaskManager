// File responsibility: Provides Spring Data queries for sprint lookup, filtering, and ownership checks.
package com.taskmanager.repository;

import com.taskmanager.entity.Sprint;
import com.taskmanager.entity.enums.SprintStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SprintRepository extends JpaRepository<Sprint, UUID> {
    /**
     * Finds every sprint owned by {@code userId}.
     */
    List<Sprint> findAllByUserId(UUID userId);

    /**
     * Finds every sprint visible to {@code userId}, either by project membership or sprint membership.
     */
    @Query("""
            select distinct sprint
            from Sprint sprint
            join sprint.project project
            left join project.members projectMember
            left join sprint.participants participant
            where projectMember.user.id = :userId or participant.id = :userId
            """)
    List<Sprint> findAllAccessibleByUserId(@Param("userId") UUID userId);

    /**
     * Finds sprints for {@code userId} that match the provided sprint {@code status}.
     */
    List<Sprint> findAllByUserIdAndStatus(UUID userId, SprintStatus status);

    /**
     * Finds visible sprints for {@code userId} that match the provided sprint {@code status}.
     */
    @Query("""
            select distinct sprint
            from Sprint sprint
            join sprint.project project
            left join project.members projectMember
            left join sprint.participants participant
            where (projectMember.user.id = :userId or participant.id = :userId)
              and sprint.status = :status
            """)
    List<Sprint> findAllAccessibleByUserIdAndStatus(
            @Param("userId") UUID userId,
            @Param("status") SprintStatus status
    );

    /**
     * Finds a sprint by id only when it is owned by {@code userId}, supporting service-layer authorization checks.
     */
    Optional<Sprint> findByIdAndUserId(UUID id, UUID userId);

    /**
     * Finds one sprint when {@code userId} owns it or is a sprint participant.
     */
    @Query("""
            select distinct sprint
            from Sprint sprint
            join sprint.project project
            left join project.members projectMember
            left join sprint.participants participant
            where sprint.id = :id
              and (projectMember.user.id = :userId or participant.id = :userId)
            """)
    Optional<Sprint> findAccessibleByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}
