package br.com.todolist.exception;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record ErrorResponse(
        String code,
        String error,
        String message,
        @JsonFormat(pattern = "dd-MM-yyyy'T'HH:mm:ss.SSSSSS")
        LocalDateTime timestamp,
        int status
) {
}
