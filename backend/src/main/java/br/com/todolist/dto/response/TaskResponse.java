package br.com.todolist.dto.response;

import br.com.todolist.enums.Priority;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        String title,
        String description,
        boolean done,
        LocalDateTime dueDate,
        Priority priority,
        UUID categoryId) {
}
