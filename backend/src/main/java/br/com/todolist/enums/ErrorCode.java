package br.com.todolist.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    //  #### USER ####
    USER_NOT_FOUND("USER_001", "User not found", HttpStatus.NOT_FOUND),
    EMAIL_NOT_FOUND("USER_002", "No account found with this email", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS("USER_003", "This email is already in use", HttpStatus.CONFLICT),

    // #### AUTHENTICATION ####
    INVALID_CREDENTIALS("AUTH_001", "Invalid email or password", HttpStatus.UNAUTHORIZED),
    TOKEN_GENERATION_ERROR("AUTH_002", "Failed to generate access token", HttpStatus.INTERNAL_SERVER_ERROR),
    TOKEN_INVALID_OR_EXPIRED("AUTH_003", "Token is invalid or has expired", HttpStatus.UNAUTHORIZED),
    ACCOUNT_NOT_VERIFIED("AUTH_004", "Please verify your email before logging in", HttpStatus.FORBIDDEN),

    // #### TASK ####
    TASK_NOT_FOUND("TASK_001", "We searched high and low but couldn't find what you're looking for.", HttpStatus.NOT_FOUND),

    // #### CATEGORY ####
    CATEGORY_NOT_FOUND("CATEGORY_001", "Category not found", HttpStatus.NOT_FOUND),
    CATEGORY_ALREADY_EXISTS("CATEGORY_002", "A category with this name already exists", HttpStatus.CONFLICT),

    // #### EMAIL ####
    EMAIL_SENDING_ERROR("EMAIL_001", "Failed to send email", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}