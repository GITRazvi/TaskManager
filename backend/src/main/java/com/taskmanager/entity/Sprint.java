// File responsibility: Maps the sprint domain entity, owner, dates, status, and associated tasks to the database.
package com.taskmanager.entity;

import com.taskmanager.entity.enums.SprintStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
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
@Table(name = "sprints")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Sprint {

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

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private SprintStatus status = SprintStatus.PLANNING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "sprint")
    @Builder.Default
    private List<Task> tasks = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "sprint_members",
            joinColumns = @JoinColumn(name = "sprint_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> participants = new LinkedHashSet<>();

    /**
     * Returns the generated sprint identifier.
     */
    public UUID getId() {
        return id;
    }

    /**
     * Sets the generated sprint identifier value.
     */
    public void setId(UUID id) {
        this.id = id;
    }

    /**
     * Returns the user who owns this sprint.
     */
    public User getUser() {
        return user;
    }

    /**
     * Sets the user who owns this sprint.
     */
    public void setUser(User user) {
        this.user = user;
    }

    /**
     * Returns the sprint name.
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the sprint name.
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns the optional sprint description.
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the optional sprint description.
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Returns the sprint start date.
     */
    public LocalDate getStartDate() {
        return startDate;
    }

    /**
     * Sets the sprint start date.
     */
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    /**
     * Returns the sprint end date.
     */
    public LocalDate getEndDate() {
        return endDate;
    }

    /**
     * Sets the sprint end date.
     */
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    /**
     * Returns the sprint lifecycle status.
     */
    public SprintStatus getStatus() {
        return status;
    }

    /**
     * Sets the sprint lifecycle status.
     */
    public void setStatus(SprintStatus status) {
        this.status = status;
    }

    /**
     * Returns the timestamp when the sprint record was created.
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Sets the timestamp when the sprint record was created.
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Returns the timestamp when the sprint record was last updated.
     */
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Sets the timestamp when the sprint record was last updated.
     */
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Returns the tasks currently attached to this sprint.
     */
    public List<Task> getTasks() {
        return tasks;
    }

    /**
     * Sets the tasks currently attached to this sprint.
     */
    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }

    /**
     * Returns the users allowed to access this sprint and its tasks.
     */
    public Set<User> getParticipants() {
        return participants;
    }

    /**
     * Sets the users allowed to access this sprint and its tasks.
     */
    public void setParticipants(Set<User> participants) {
        this.participants = participants;
    }
}
