package br.com.todolist.dto.request;

import br.com.todolist.enums.Priority;

import java.time.LocalDateTime;

public record TaskUpdateRequest(
        String title,
        String description,
        LocalDateTime dueDate,
        Priority priority,
        Long categoryId
) {}