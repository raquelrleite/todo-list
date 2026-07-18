package br.com.todolist.dto.response;

import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String title) {
}
