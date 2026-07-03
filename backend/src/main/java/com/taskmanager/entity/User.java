// File responsibility: Maps the user domain entity, authentication fields, profile fields, tasks, and sprints to the database.
package com.taskmanager.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user")
    @Builder.Default
    private List<Task> tasks = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    @Builder.Default
    private List<Sprint> sprints = new ArrayList<>();

    /**
     * Returns the generated user identifier.
     */
    public UUID getId() {
        return id;
    }

    /**
     * Sets the generated user identifier value.
     */
    public void setId(UUID id) {
        this.id = id;
    }

    /**
     * Returns the user's unique username.
     */
    public String getUsername() {
        return username;
    }

    /**
     * Sets the user's unique username.
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Returns the user's unique email address.
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the user's unique email address.
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Returns the hashed password stored for authentication.
     */
    public String getPasswordHash() {
        return passwordHash;
    }

    /**
     * Sets the hashed password value used during authentication.
     */
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    /**
     * Returns the user's optional display name.
     */
    public String getFullName() {
        return fullName;
    }

    /**
     * Sets the user's optional display name.
     */
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    /**
     * Returns the optional URL for the user's avatar image.
     */
    public String getAvatarUrl() {
        return avatarUrl;
    }

    /**
     * Sets the optional URL for the user's avatar image.
     */
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    /**
     * Returns whether the user is active and allowed to authenticate.
     */
    public boolean isActive() {
        return active;
    }

    /**
     * Sets whether the user is active and allowed to authenticate.
     */
    public void setActive(boolean active) {
        this.active = active;
    }

    /**
     * Returns the timestamp when the user record was created.
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Sets the timestamp when the user record was created.
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Returns the timestamp when the user record was last updated.
     */
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Sets the timestamp when the user record was last updated.
     */
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Returns the tasks owned by this user.
     */
    public List<Task> getTasks() {
        return tasks;
    }

    /**
     * Sets the tasks owned by this user.
     */
    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }

    /**
     * Returns the sprints owned by this user.
     */
    public List<Sprint> getSprints() {
        return sprints;
    }

    /**
     * Sets the sprints owned by this user.
     */
    public void setSprints(List<Sprint> sprints) {
        this.sprints = sprints;
    }
}
