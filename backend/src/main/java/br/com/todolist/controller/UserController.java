package br.com.todolist.controller;

import br.com.todolist.dto.request.*;
import br.com.todolist.dto.response.LoginResponse;
import br.com.todolist.dto.response.MessageResponse;
import br.com.todolist.dto.response.UserResponse;
import br.com.todolist.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@RequestBody @Valid UserRequest request) {
        log.info("Registering new user with email: {}", request.email());
        return service.register(request);
    }

    @GetMapping("/account-confirmation")
    public MessageResponse confirm(@RequestParam String token) {
        log.info("Confirming account with token");
        return service.confirmAccount(token);
    }

    @PostMapping("/resend-confirmation")
    public MessageResponse resendConfirmation(@RequestBody @Valid EmailRequest request) {
        log.info("Resending confirmation email for: {}", request.email());
        return service.resendConfirmation(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginRequest request) {
        log.info("Processing login for user: {}", request.email());
        return service.login(request);
    }

    @PostMapping("/refresh")
    public LoginResponse refresh(@RequestBody @Valid RefreshRequest request) {
        log.info("Refreshing token");
        return service.refresh(request.refreshToken());
    }

    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@RequestBody @Valid EmailRequest request) {
        log.info("Processing forgot password for email: {}", request.email());
        return service.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        log.info("Processing reset password");
        return service.resetPassword(request);
    }
}
