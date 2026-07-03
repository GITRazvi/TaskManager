// File responsibility: Exposes user profile endpoints for reading, updating, and changing passwords.
package com.taskmanager.controller;

import com.taskmanager.dto.ApiResponse;
import com.taskmanager.dto.ChangePasswordRequest;
import com.taskmanager.dto.UpdateUserRequest;
import com.taskmanager.dto.UserResponse;
import com.taskmanager.security.UserPrincipal;
import com.taskmanager.service.UserService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    /**
     * Creates the user controller with the service that enforces profile ownership and password rules.
     */
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Retrieves the profile for {@code id}; {@code principal} supplies the current user id for self-access checks.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.getProfile(id, principal.getId()),
                "User profile retrieved successfully"
        ));
    }

    /**
     * Updates profile fields for {@code id} after confirming it matches the authenticated principal id.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateProfile(id, principal.getId(), request),
                "User profile updated successfully"
        ));
    }

    /**
     * Changes the password for {@code id} after validating ownership and the current password in the request.
     */
    @PutMapping("/{id}/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(id, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }
}
