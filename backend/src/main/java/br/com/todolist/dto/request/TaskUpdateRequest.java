package br.com.todolist.dto.request;

import br.com.todolist.enums.Priority;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskUpdateRequest(
        String title,
        String description,
        LocalDateTime dueDate,
        Priority priority,
        UUID categoryId
) {}