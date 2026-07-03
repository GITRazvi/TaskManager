// File responsibility: Provides Spring Data queries for user lookup and uniqueness checks.
package com.taskmanager.repository;

import com.taskmanager.entity.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {
    /**
     * Finds a user by unique email address, commonly used during login.
     */
    Optional<User> findByEmail(String email);

    /**
     * Finds a user by unique username.
     */
    Optional<User> findByUsername(String username);

    /**
     * Checks whether the supplied email is already assigned to any user.
     */
    boolean existsByEmail(String email);

    /**
     * Checks whether the supplied username is already assigned to any user.
     */
    boolean existsByUsername(String username);
}
