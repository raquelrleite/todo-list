package br.com.todolist.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequest(
         @NotBlank String title) {
}
