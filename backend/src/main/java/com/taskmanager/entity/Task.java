// File responsibility: Maps the task domain entity, ownership, sprint assignment, status, priority, and due date to the database.
package com.taskmanager.entity;

import com.taskmanager.entity.enums.TaskPriority;
import com.taskmanager.entity.enums.TaskStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
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
@Table(name = "tasks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @Column(name = "story_points")
    private Integer storyPoints;

    @Column(name = "estimated_hours", precision = 8, scale = 2)
    private BigDecimal estimatedHours;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<TaskComment> comments = new ArrayList<>();

    @Column(name = "due_date")
    private LocalDate dueDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Returns the generated task identifier.
     */
    public UUID getId() {
        return id;
    }

    /**
     * Sets the generated task identifier value.
     */
    public void setId(UUID id) {
        this.id = id;
    }

    /**
     * Returns the user who owns this task.
     */
    public User getUser() {
        return user;
    }

    /**
     * Sets the user who owns this task.
     */
    public void setUser(User user) {
        this.user = user;
    }

    /**
     * Returns the optional sprint that groups this task.
     */
    public Sprint getSprint() {
        return sprint;
    }

    /**
     * Sets the optional sprint that groups this task.
     */
    public void setSprint(Sprint sprint) {
        this.sprint = sprint;
    }

    /**
     * Returns the task title shown in lists and boards.
     */
    public String getTitle() {
        return title;
    }

    /**
     * Sets the task title shown in lists and boards.
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Returns the optional detailed task description.
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the optional detailed task description.
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Returns the workflow status for the task.
     */
    public TaskStatus getStatus() {
        return status;
    }

    /**
     * Sets the workflow status for the task.
     */
    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    /**
     * Returns the priority used for sorting and filtering tasks.
     */
    public TaskPriority getPriority() {
        return priority;
    }

    /**
     * Sets the priority used for sorting and filtering tasks.
     */
    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    /**
     * Returns the optional user assigned to complete this task.
     */
    public User getAssignedTo() {
        return assignedTo;
    }

    /**
     * Sets the optional user assigned to complete this task.
     */
    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }

    /**
     * Returns the optional user assigned to review this task.
     */
    public User getReviewer() {
        return reviewer;
    }

    /**
     * Sets the optional user assigned to review this task.
     */
    public void setReviewer(User reviewer) {
        this.reviewer = reviewer;
    }

    /**
     * Returns the developer-assigned story point estimate.
     */
    public Integer getStoryPoints() {
        return storyPoints;
    }

    /**
     * Sets the developer-assigned story point estimate.
     */
    public void setStoryPoints(Integer storyPoints) {
        this.storyPoints = storyPoints;
    }

    /**
     * Returns the developer-estimated or logged hours for completing this task.
     */
    public BigDecimal getEstimatedHours() {
        return estimatedHours;
    }

    /**
     * Sets the developer-estimated or logged hours for completing this task.
     */
    public void setEstimatedHours(BigDecimal estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    /**
     * Returns the comment history attached to this task.
     */
    public List<TaskComment> getComments() {
        return comments;
    }

    /**
     * Sets the comment history attached to this task.
     */
    public void setComments(List<TaskComment> comments) {
        this.comments = comments;
    }

    /**
     * Returns the optional due date for this task.
     */
    public LocalDate getDueDate() {
        return dueDate;
    }

    /**
     * Sets the optional due date for this task.
     */
    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    /**
     * Returns the timestamp when the task record was created.
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Sets the timestamp when the task record was created.
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Returns the timestamp when the task record was last updated.
     */
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Sets the timestamp when the task record was last updated.
     */
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
