package br.com.todolist.dto.response;

import jakarta.validation.constraints.NotBlank;

public record LoginResponse(
        String accessToken,
        @NotBlank String refreshToken,
        String name){
}
