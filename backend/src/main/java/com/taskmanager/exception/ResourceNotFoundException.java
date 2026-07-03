// File responsibility: Defines the application exception used when requested resources cannot be found.
package com.taskmanager.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends AppException {
    /**
     * Creates a 404 application exception with the shared RESOURCE_NOT_FOUND error code and supplied message.
     */
    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", message);
    }
}
