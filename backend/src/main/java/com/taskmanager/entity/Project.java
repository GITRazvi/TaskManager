// File responsibility: Maps user-owned projects that group sprints.
package com.taskmanager.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "projects")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "project")
    @Builder.Default
    private List<Sprint> sprints = new ArrayList<>();

    @OneToMany(mappedBy = "project")
    @Builder.Default
    private List<ProjectMember> members = new ArrayList<>();

    /**
     * Returns the generated project identifier.
     */
    public UUID getId() {
        return id;
    }

    /**
     * Sets the generated project identifier value.
     */
    public void setId(UUID id) {
        this.id = id;
    }

    /**
     * Returns the user who owns this project.
     */
    public User getUser() {
        return user;
    }

    /**
     * Sets the user who owns this project.
     */
    public void setUser(User user) {
        this.user = user;
    }

    /**
     * Returns the project name.
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the project name.
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns the optional project description.
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the optional project description.
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Returns the timestamp when the project record was created.
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Sets the timestamp when the project record was created.
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Returns the timestamp when the project record was last updated.
     */
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Sets the timestamp when the project record was last updated.
     */
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Returns the sprints attached to this project.
     */
    public List<Sprint> getSprints() {
        return sprints;
    }

    /**
     * Sets the sprints attached to this project.
     */
    public void setSprints(List<Sprint> sprints) {
        this.sprints = sprints;
    }

    /**
     * Returns the users who belong to this project with project-scoped roles.
     */
    public List<ProjectMember> getMembers() {
        return members;
    }

    /**
     * Sets the project-scoped member list.
     */
    public void setMembers(List<ProjectMember> members) {
        this.members = members;
    }
}
