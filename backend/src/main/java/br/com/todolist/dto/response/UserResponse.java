package br.com.todolist.dto.response;

public record UserResponse(
        Long id,
        String name,
        String email) {
}
