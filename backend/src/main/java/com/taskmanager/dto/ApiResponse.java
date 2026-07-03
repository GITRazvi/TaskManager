// File responsibility: Defines the standard API response envelope for successful and failed backend responses.
package com.taskmanager.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        T data,
        String message,
        String error,
        Instant timestamp
) {
    /**
     * Creates a successful API envelope with response {@code data}, a human-readable {@code message}, and timestamp.
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, data, message, null, Instant.now());
    }

    /**
     * Creates a failed API envelope with machine-readable {@code error}, human-readable {@code message}, and timestamp.
     */
    public static <T> ApiResponse<T> failure(String error, String message) {
        return new ApiResponse<>(false, null, message, error, Instant.now());
    }
}
