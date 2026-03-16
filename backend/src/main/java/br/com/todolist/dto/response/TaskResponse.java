package br.com.todolist.dto.response;

import br.com.todolist.enums.Priority;

import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        boolean done,
        LocalDateTime dueDate,
        Priority priority,
        Long categoryId) {
}
