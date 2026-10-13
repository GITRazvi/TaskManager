// File responsibility: Implements profile access, profile updates, password changes, and self-access checks.
package com.taskmanager.service;

import com.taskmanager.dto.ChangePasswordRequest;
import com.taskmanager.dto.CreateUserRequest;
import com.taskmanager.dto.UpdateUserRequest;
import com.taskmanager.dto.UpdateUserRoleRequest;
import com.taskmanager.dto.UserResponse;
import com.taskmanager.entity.User;
import com.taskmanager.entity.enums.UserRole;
import com.taskmanager.exception.AppException;
import com.taskmanager.exception.ForbiddenException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.UserRepository;
import java.util.List;
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
     * Returns all active users available for task assignment.
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getActiveUsers() {
        return userRepository.findByActiveTrueOrderByFullNameAscUsernameAsc()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    /**
     * Creates a user with an explicit role after confirming the current user is an administrator.
     */
    @Transactional
    public UserResponse createUser(CreateUserRequest request, UserRole currentUserRole) {
        ensureCanManageUsers(currentUserRole);
        if (userRepository.existsByEmail(request.email())) {
            throw new AppException(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "Email is already registered");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new AppException(HttpStatus.CONFLICT, "USERNAME_ALREADY_EXISTS", "Username is already taken");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRole(request.role());
        user.setActive(true);

        return UserResponse.from(userRepository.save(user));
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
     * Changes a user's role after confirming the current user is an administrator.
     */
    @Transactional
    public UserResponse updateRole(
            UUID requestedUserId,
            UUID currentUserId,
            UserRole currentUserRole,
            UpdateUserRoleRequest request
    ) {
        ensureCanManageUsers(currentUserRole);
        User user = getUserEntity(requestedUserId);
        user.setRole(request.role());
        return UserResponse.from(user);
    }

    /**
     * Soft-deletes a user after confirming the current user is an administrator.
     */
    @Transactional
    public void deleteUser(UUID requestedUserId, UUID currentUserId, UserRole currentUserRole) {
        ensureCanManageUsers(currentUserRole);
        if (requestedUserId.equals(currentUserId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "CANNOT_DELETE_SELF", "You cannot delete your own account");
        }
        User user = getUserEntity(requestedUserId);
        user.setActive(false);
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

    /**
     * Ensures the supplied role has user-management privileges.
     */
    private void ensureCanManageUsers(UserRole role) {
        if (role == null || !role.canManageUsers()) {
            throw new ForbiddenException("Global user role management is disabled");
        }
    }
}
