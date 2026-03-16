package br.com.todolist.enums;

import lombok.*;

@Getter
@AllArgsConstructor
public enum EmailType {

    ACCOUNT_CONFIRMATION("Confirm your account", "account-confirmation", "Your account has been confirmed."),
    PASSWORD_CHANGED("Your password has been changed", "password-changed", "Your password was updated successfully."),
    PASSWORD_RESET("Password reset request", "password-reset", "If an account with that email exists, a password reset link has been sent.");

    private final String subject;
    private final String template;
    private final String message;
}