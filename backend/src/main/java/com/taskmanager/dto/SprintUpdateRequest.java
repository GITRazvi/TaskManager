// File responsibility: Defines the request body for partial sprint updates.
package com.taskmanager.dto;

import com.taskmanager.entity.enums.SprintStatus;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record SprintUpdateRequest(
        @Size(max = 255)
        String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        SprintStatus status,
        List<@Size(max = 255) String> participantIdentifiers
) {
}
