// File responsibility: Bootstraps the TaskManager Spring Boot backend application.
package com.taskmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Main Spring Boot Application class for TaskManager backend.
 * 
 * This application provides a RESTful API for managing tasks and sprints
 * with JWT-based authentication and PostgreSQL persistence.
 * 
 * Features:
 * - User authentication and authorization (JWT)
 * - Task management (CRUD operations)
 * - Sprint/project organization
 * - Kanban board with task status tracking
 * - Database migrations (Flyway)
 * 
 * @author TaskManager Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableTransactionManagement
@EnableAsync
public class TaskManagerApplication {

    /**
     * Starts the Spring Boot application; {@code args} contains optional command-line startup arguments.
     */
    public static void main(String[] args) {
        SpringApplication.run(TaskManagerApplication.class, args);
    }

}
