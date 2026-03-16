package br.com.todolist.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;

public record ResetPasswordRequest(
        @NotBlank(message = "Token is required")
        String token,

        @NotBlank(message = "Password is required")
        String password,

        @NotBlank(message = "Password confirmation is required")
        String passwordConfirmation
) {
    @AssertTrue(message = "Passwords do not match")
    public boolean isPasswordMatching() {
        return password != null && password.equals(passwordConfirmation);
    }

    @AssertTrue(message = "Password must be at least 8 characters and contain one uppercase letter, one number and one special character")
    public boolean isPasswordValid() {
        if (password == null) return false;
        return password.length() >= 8
                && password.chars().anyMatch(Character::isUpperCase)
                && password.chars().anyMatch(Character::isDigit)
                && password.chars().anyMatch(c -> !Character.isLetterOrDigit(c));
    }
}
