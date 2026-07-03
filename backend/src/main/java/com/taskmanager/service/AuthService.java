// File responsibility: Implements registration, login, refresh-token validation, and auth response creation.
package com.taskmanager.service;

import com.taskmanager.dto.AuthResponse;
import com.taskmanager.dto.LoginRequest;
import com.taskmanager.dto.RefreshTokenRequest;
import com.taskmanager.dto.RegisterRequest;
import com.taskmanager.dto.UserResponse;
import com.taskmanager.entity.User;
import com.taskmanager.exception.AppException;
import com.taskmanager.exception.UnauthorizedException;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtTokenProvider;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Creates the auth service with repositories, password hashing, and JWT token generation dependencies.
     */
    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * Registers a new active user after checking that the request email and username are unique.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
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
        user.setActive(true);

        return toAuthResponse(userRepository.save(user));
    }

    /**
     * Authenticates an active user by email and password, then returns an auth response with JWT credentials.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .filter(User::isActive)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        return toAuthResponse(user);
    }

    /**
     * Validates a refresh token, loads the active token subject user, and returns a new token pair.
     */
    @Transactional(readOnly = true)
    public AuthResponse refresh(RefreshTokenRequest request) {
        String token = request.refreshToken();
        if (!jwtTokenProvider.isValid(token) || !"refresh".equals(jwtTokenProvider.getTokenType(token))) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        UUID userId = jwtTokenProvider.getUserId(token);
        User user = userRepository.findById(userId)
                .filter(User::isActive)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        return toAuthResponse(user);
    }

    /**
     * Builds the API auth payload for {@code user}, including access token, refresh token, expiry, and public profile.
     */
    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(
                jwtTokenProvider.generateAccessToken(user),
                jwtTokenProvider.generateRefreshToken(user),
                "Bearer",
                jwtTokenProvider.getExpirationMs(),
                UserResponse.from(user)
        );
    }
}
