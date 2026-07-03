// File responsibility: Defines the application exception used when authenticated users access forbidden resources.
package com.taskmanager.exception;

import org.springframework.http.HttpStatus;

public class ForbiddenException extends AppException {
    /**
     * Creates a 403 application exception with the shared FORBIDDEN error code and supplied message.
     */
    public ForbiddenException(String message) {
        super(HttpStatus.FORBIDDEN, "FORBIDDEN", message);
    }
}
