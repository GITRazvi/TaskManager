// File responsibility: Provides Spring Data queries for user lookup and uniqueness checks.
package com.taskmanager.repository;

import com.taskmanager.entity.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, UUID> {
    /**
     * Returns active users ordered for people pickers and directory-style views.
     */
    List<User> findByActiveTrueOrderByFullNameAscUsernameAsc();

    /**
     * Finds a user by unique email address, commonly used during login.
     */
    Optional<User> findByEmail(String email);

    /**
     * Finds a user by unique username.
     */
    Optional<User> findByUsername(String username);

    /**
     * Finds an active user by username or email, case-insensitively, for sprint member lookup.
     */
    @Query("""
            select u
            from User u
            where u.active = true
              and (lower(u.username) = lower(:identifier) or lower(u.email) = lower(:identifier))
            """)
    Optional<User> findActiveByUsernameOrEmail(@Param("identifier") String identifier);

    /**
     * Checks whether the supplied email is already assigned to any user.
     */
    boolean existsByEmail(String email);

    /**
     * Checks whether the supplied username is already assigned to any user.
     */
    boolean existsByUsername(String username);
}
