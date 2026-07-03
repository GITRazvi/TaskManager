// File responsibility: Implements profile access, profile updates, password changes, and self-access checks.
package com.taskmanager.service;

import com.taskmanager.dto.ChangePasswordRequest;
import com.taskmanager.dto.UpdateUserRequest;
import com.taskmanager.dto.UserResponse;
import com.taskmanager.entity.User;
import com.taskmanager.exception.AppException;
import com.taskmanager.exception.ForbiddenException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.UserRepository;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Creates the user service with user lookup/persistence and password hashing dependencies.
     */
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Loads an active User entity by {@code userId}, throwing not found for missing or inactive users.
     */
    @Transactional(readOnly = true)
    public User getUserEntity(UUID userId) {
        return userRepository.findById(userId)
                .filter(User::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    /**
     * Returns a public profile after ensuring {@code requestedUserId} matches the authenticated {@code currentUserId}.
     */
    @Transactional(readOnly = true)
    public UserResponse getProfile(UUID requestedUserId, UUID currentUserId) {
        ensureSelf(requestedUserId, currentUserId);
        return UserResponse.from(getUserEntity(requestedUserId));
    }

    /**
     * Updates self profile fields, checking username/email uniqueness only when those values actually change.
     */
    @Transactional
    public UserResponse updateProfile(UUID requestedUserId, UUID currentUserId, UpdateUserRequest request) {
        ensureSelf(requestedUserId, currentUserId);
        User user = getUserEntity(requestedUserId);

        if (request.username() != null && !request.username().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.username())) {
                throw new AppException(HttpStatus.CONFLICT, "USERNAME_ALREADY_EXISTS", "Username is already taken");
            }
            user.setUsername(request.username());
        }
        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new AppException(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "Email is already registered");
            }
            user.setEmail(request.email());
        }
        if (request.fullName() != null) {
            user.setFullName(request.fullName());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }

        return UserResponse.from(user);
    }

    /**
     * Changes the current user's password after matching the request current password against the stored hash.
     */
    @Transactional
    public void changePassword(UUID requestedUserId, UUID currentUserId, ChangePasswordRequest request) {
        ensureSelf(requestedUserId, currentUserId);
        User user = getUserEntity(requestedUserId);

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_CURRENT_PASSWORD", "Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    }

    /**
     * Enforces self-service profile access by comparing requested and authenticated user ids.
     */
    private void ensureSelf(UUID requestedUserId, UUID currentUserId) {
        if (!requestedUserId.equals(currentUserId)) {
            throw new ForbiddenException("You can only access your own profile");
        }
    }
}
