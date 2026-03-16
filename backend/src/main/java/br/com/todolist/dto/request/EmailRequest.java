package br.com.todolist.dto.request;

import jakarta.validation.constraints.NotBlank;

public record EmailRequest(
        @NotBlank(message = "Email is required")
        String email) {
}
