// File responsibility: Converts validation, application, and unexpected exceptions into standard API error responses.
package com.taskmanager.exception;

import com.taskmanager.dto.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Converts expected AppException instances into API error responses using their status and error code.
     */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException exception) {
        return ResponseEntity
                .status(exception.getStatus())
                .body(ApiResponse.failure(exception.getErrorCode(), exception.getMessage()));
    }

    /**
     * Converts request-body validation errors into a bad-request response using the first field error message.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("Validation failed");

        return ResponseEntity
                .badRequest()
                .body(ApiResponse.failure("VALIDATION_ERROR", message));
    }

    /**
     * Converts method-parameter constraint violations into a bad-request API response.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(ConstraintViolationException exception) {
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.failure("VALIDATION_ERROR", exception.getMessage()));
    }

    /**
     * Converts unreadable JSON bodies, including invalid enum and date values, into a bad-request API response.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnreadableMessage(HttpMessageNotReadableException exception) {
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.failure("VALIDATION_ERROR", "Request body is invalid or contains unsupported values"));
    }

    /**
     * Converts invalid request parameter values, such as unsupported enum filters, into a bad-request response.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException exception) {
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.failure(
                        "VALIDATION_ERROR",
                        exception.getName() + ": invalid value"
                ));
    }

    /**
     * Converts unsupported content types into a client error instead of a generic server error.
     */
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnsupportedMediaType(HttpMediaTypeNotSupportedException exception) {
        return ResponseEntity
                .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(ApiResponse.failure("UNSUPPORTED_MEDIA_TYPE", "Content type is not supported"));
    }

    /**
     * Handles unexpected exceptions with a generic internal-server-error response while hiding implementation details.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception exception) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.failure("INTERNAL_SERVER_ERROR", "Unexpected server error"));
    }
}
