package br.com.todolist.dto.request;

import br.com.todolist.enums.Priority;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public record TaskCreateRequest(
        @NotBlank String title,
        String description,
        LocalDateTime dueDate,
        Priority priority,
        Long categoryId
) {}