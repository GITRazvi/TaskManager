// File responsibility: Defines the base application exception carrying HTTP status and API error code.
package com.taskmanager.exception;

import org.springframework.http.HttpStatus;

public class AppException extends RuntimeException {
    private final HttpStatus status;
    private final String errorCode;

    /**
     * Creates an application exception carrying HTTP status, machine-readable error code, and user-facing message.
     */
    public AppException(HttpStatus status, String errorCode, String message) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    /**
     * Returns the HTTP status that should be used for the API response.
     */
    public HttpStatus getStatus() {
        return status;
    }

    /**
     * Returns the machine-readable error code included in the API response body.
     */
    public String getErrorCode() {
        return errorCode;
    }
}
