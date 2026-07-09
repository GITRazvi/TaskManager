// File responsibility: Tests authentication service registration, token creation, duplicate-email handling, and login failure behavior.
package com.taskmanager.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.taskmanager.dto.LoginRequest;
import com.taskmanager.dto.RegisterRequest;
import com.taskmanager.entity.User;
import com.taskmanager.entity.enums.UserRole;
import com.taskmanager.exception.AppException;
import com.taskmanager.exception.UnauthorizedException;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtTokenProvider;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private JwtTokenProvider jwtTokenProvider;

    private AuthService authService;

    /**
     * Creates a real JWT provider and the AuthService under test with mocked persistence and password hashing.
     */
    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(
                "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                900000L,
                604800000L
        );
        authService = new AuthService(userRepository, passwordEncoder, jwtTokenProvider);
    }

    /**
     * Verifies registration saves an active user and returns valid access/refresh tokens for the request data.
     */
    @Test
    void registerCreatesActiveUserAndReturnsTokens() {
        RegisterRequest request = new RegisterRequest("alex", "alex@example.com", "password123", "Alex User");
        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(userRepository.existsByUsername(request.username())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(UUID.randomUUID());
            return user;
        });

        var response = authService.register(request);

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.expiresIn()).isEqualTo(900000L);
        assertThat(response.user().email()).isEqualTo(request.email());
        assertThat(response.user().role()).isEqualTo(UserRole.DEVELOPER);
        assertThat(response.user().active()).isTrue();
        assertThat(jwtTokenProvider.isValid(response.accessToken())).isTrue();
        assertThat(jwtTokenProvider.getTokenType(response.accessToken())).isEqualTo("access");
        assertThat(jwtTokenProvider.isValid(response.refreshToken())).isTrue();
        assertThat(jwtTokenProvider.getTokenType(response.refreshToken())).isEqualTo("refresh");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getUsername()).isEqualTo(request.username());
        assertThat(savedUser.getEmail()).isEqualTo(request.email());
        assertThat(savedUser.getPasswordHash()).isEqualTo("encoded-password");
        assertThat(savedUser.getFullName()).isEqualTo(request.fullName());
        assertThat(savedUser.getRole()).isEqualTo(UserRole.DEVELOPER);
        assertThat(savedUser.isActive()).isTrue();
    }

    /**
     * Verifies duplicate request email is rejected before saving a new user.
     */
    @Test
    void registerRejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("alex", "alex@example.com", "password123", "Alex User");
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(AppException.class)
                .hasMessage("Email is already registered")
                .extracting("errorCode")
                .isEqualTo("EMAIL_ALREADY_EXISTS");

        verify(userRepository, never()).save(any(User.class));
    }

    /**
     * Verifies login fails when the submitted password does not match the stored password hash.
     */
    @Test
    void loginRejectsInvalidPassword() {
        User user = activeUser(UUID.randomUUID());
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", user.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest(user.getEmail(), "wrong-password")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid email or password");
    }

    /**
     * Builds an active User fixture with the supplied {@code userId} and authentication fields used by tests.
     */
    private static User activeUser(UUID userId) {
        User user = new User();
        user.setId(userId);
        user.setUsername("alex");
        user.setEmail("alex@example.com");
        user.setPasswordHash("encoded-password");
        user.setActive(true);
        return user;
    }
}
