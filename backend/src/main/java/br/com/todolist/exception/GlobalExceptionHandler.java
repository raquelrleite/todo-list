package br.com.todolist.exception;


import br.com.todolist.enums.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        var errorCode = ex.getErrorCode();

        var response = new ErrorResponse(
                errorCode.getCode(),
                errorCode.getHttpStatus().getReasonPhrase(),
                errorCode.getMessage(),
                LocalDateTime.now(),
                errorCode.getHttpStatus().value()
        );

        return ResponseEntity.status(errorCode.getHttpStatus()).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String combinedErrors = ex.getBindingResult()
                .getAllErrors()
                .stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.joining(", "));

        var response = new ErrorResponse(
                "VALIDATION_001",
                "Validation Error",
                combinedErrors,
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value()
        );

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException ex) {
        var errorCode = ErrorCode.INVALID_CREDENTIALS;

        var response = new ErrorResponse(
                errorCode.getCode(),
                errorCode.getHttpStatus().getReasonPhrase(),
                errorCode.getMessage(),
                LocalDateTime.now(),
                errorCode.getHttpStatus().value()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex) {
        var response = new ErrorResponse(
                "AUTH_005",
                "Access Denied",
                "You don't have permission to access this resource",
                LocalDateTime.now(),
                HttpStatus.FORBIDDEN.value()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);

        var response = new ErrorResponse(
                "INTERNAL_001",
                "Internal Server Error",
                "An unexpected error occurred",
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value()
        );

        return ResponseEntity.internalServerError().body(response);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        var response = new ErrorResponse(
                "METHOD_001",
                "Method Not Allowed",
                "Request method '" + ex.getMethod() + "' is not supported",
                LocalDateTime.now(),
                HttpStatus.METHOD_NOT_ALLOWED.value()
        );
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response);
    }
}