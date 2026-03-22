package br.com.todolist.controller;

import br.com.todolist.dto.request.*;
import br.com.todolist.dto.response.LoginResponse;
import br.com.todolist.dto.response.MessageResponse;
import br.com.todolist.dto.response.UserResponse;
import br.com.todolist.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@RequestBody @Valid UserRequest request) {
        return service.register(request);
    }

    @GetMapping("/account-confirmation")
    public MessageResponse confirm(@RequestParam String token) {
        return service.confirmAccount(token);
    }

    @PostMapping("/resend-confirmation")
    public MessageResponse resendConfirmation(@RequestBody @Valid EmailRequest request) {
        return service.resendConfirmation(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginRequest request) {
        return service.login(request);
    }

    @PostMapping("/refresh")
    public LoginResponse refresh(@RequestBody @Valid RefreshRequest request) {
        return service.refresh(request.refreshToken());
    }

    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@RequestBody @Valid EmailRequest request) {
        return service.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        return service.resetPassword(request);
    }
}
