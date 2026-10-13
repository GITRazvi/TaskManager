// File responsibility: Provides project membership and role lookup queries.
package com.taskmanager.repository;

import com.taskmanager.entity.ProjectMember;
import com.taskmanager.entity.enums.ProjectRole;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, UUID> {
    Optional<ProjectMember> findByProjectIdAndUserId(UUID projectId, UUID userId);

    List<ProjectMember> findAllByProjectIdOrderByUserFullNameAscUserUsernameAsc(UUID projectId);

    boolean existsByProjectIdAndUserId(UUID projectId, UUID userId);

    long countByProjectIdAndRole(UUID projectId, ProjectRole role);

    @Query("""
            select member.role
            from ProjectMember member
            where member.project.id = :projectId and member.user.id = :userId
            """)
    Optional<ProjectRole> findRoleByProjectIdAndUserId(@Param("projectId") UUID projectId, @Param("userId") UUID userId);
}
