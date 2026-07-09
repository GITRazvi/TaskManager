// File responsibility: Adapts the User entity to Spring Security UserDetails for authenticated requests.
package com.taskmanager.security;

import com.taskmanager.entity.User;
import com.taskmanager.entity.enums.UserRole;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class UserPrincipal implements UserDetails {
    private final UUID id;
    private final String username;
    private final String email;
    private final String password;
    private final UserRole role;
    private final boolean active;

    /**
     * Copies security-relevant User fields into an immutable principal used by Spring Security.
     */
    public UserPrincipal(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.role = user.getRole();
        this.active = user.isActive();
    }

    /**
     * Returns the authenticated user's UUID for ownership checks in controllers and services.
     */
    public UUID getId() {
        return id;
    }

    /**
     * Returns the authenticated user's email copied from the backing User entity.
     */
    public String getEmail() {
        return email;
    }

    /**
     * Returns the authenticated user's application role.
     */
    public UserRole getRole() {
        return role;
    }

    /**
     * Returns the Spring Security authority derived from the application role.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    /**
     * Returns the stored password hash required by the UserDetails contract.
     */
    @Override
    public String getPassword() {
        return password;
    }

    /**
     * Returns the username used by Spring Security as the principal display identifier.
     */
    @Override
    public String getUsername() {
        return username;
    }

    /**
     * Indicates account expiration state; accounts do not expire in this application.
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Indicates lock state using the {@code active} flag because inactive users should not authenticate.
     */
    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    /**
     * Indicates credential expiration state; password hashes do not expire automatically here.
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Indicates whether the principal is enabled using the copied {@code active} flag.
     */
    @Override
    public boolean isEnabled() {
        return active;
    }
}
