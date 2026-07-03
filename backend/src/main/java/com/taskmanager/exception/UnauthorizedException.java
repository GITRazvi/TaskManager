// File responsibility: Defines the application exception used for failed authentication and invalid credentials.
package com.taskmanager.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends AppException {
    /**
     * Creates a 401 application exception with the shared UNAUTHORIZED error code and supplied message.
     */
    public UnauthorizedException(String message) {
        super(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", message);
    }
}
