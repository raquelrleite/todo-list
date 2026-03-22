package br.com.todolist.service;

import br.com.todolist.dto.request.EmailRequest;
import br.com.todolist.dto.request.LoginRequest;
import br.com.todolist.dto.request.ResetPasswordRequest;
import br.com.todolist.dto.request.UserRequest;
import br.com.todolist.dto.response.LoginResponse;
import br.com.todolist.dto.response.MessageResponse;
import br.com.todolist.dto.response.UserResponse;
import br.com.todolist.enums.UserRole;
import br.com.todolist.exception.BusinessException;
import br.com.todolist.infra.email.EmailService;
import br.com.todolist.infra.security.TokenService;
import br.com.todolist.infra.security.UserDetailsImpl;
import br.com.todolist.mapper.UserMapper;
import br.com.todolist.model.User;
import br.com.todolist.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

import static br.com.todolist.enums.AuthProvider.LOCAL;
import static br.com.todolist.enums.EmailType.*;
import static br.com.todolist.enums.ErrorCode.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    @Value("${app.url}")
    private String appUrl;

    @Value("${jwt.confirmation-expiration-hours}")
    private long confirmationExpirationHours;

    private static final String EXPIRATION_HOURS = "expirationHours";

    private final UserRepository repository;
    private final UserMapper mapper;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserResponse register(UserRequest request) {
        if (repository.existsByEmail(request.email())) {
            throw new BusinessException(EMAIL_ALREADY_EXISTS);
        }

        var user = mapper.toEntity(request);
        user.setRole(UserRole.USER);
        user.setProvider(LOCAL);
        user.setPassword(passwordEncoder.encode(request.password()));
        repository.save(user);

        String token = tokenService.generateAccountConfirmationToken(user);

        emailService.sendEmail(user.getEmail(), ACCOUNT_CONFIRMATION, Map.of(
                "name", user.getName(),
                "confirmUrl", appUrl + "/account-confirmation?token=" + token,
                EXPIRATION_HOURS, confirmationExpirationHours
        ));

        return mapper.toResponse(user);
    }

    public MessageResponse confirmAccount(String token) {
        String email = tokenService.validateAccountConfirmationToken(token);

        if (email == null) {
            throw new BusinessException(TOKEN_INVALID_OR_EXPIRED);
        }

        var user = repository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(USER_NOT_FOUND));

        user.setVerified(true);
        repository.save(user);

        return new MessageResponse(ACCOUNT_CONFIRMATION.getMessage());
    }

    public MessageResponse resendConfirmation(EmailRequest request) {
        repository.findByEmail(request.email()).ifPresent(user -> {
            if (!user.isVerified()) {
                String token = tokenService.generateAccountConfirmationToken(user);
                emailService.sendEmail(user.getEmail(), ACCOUNT_CONFIRMATION, Map.of(
                        "name", user.getName(),
                        "confirmUrl", appUrl + "/account-confirmation?token=" + token,
                        EXPIRATION_HOURS, confirmationExpirationHours
                ));
            }
        });
        return new MessageResponse(ACCOUNT_CONFIRMATION.getMessage());
    }

    public LoginResponse login(LoginRequest request) {
        try {
            var authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );

            if (!(authentication.getPrincipal() instanceof UserDetailsImpl(User user))) {
                throw new BusinessException(INVALID_CREDENTIALS);
            }

            if (!user.isVerified()) {
                throw new BusinessException(ACCOUNT_NOT_VERIFIED);
            }

            return new LoginResponse(
                    tokenService.generateAccessToken(user),
                    tokenService.generateRefreshToken(user),
                    user.getName()
            );

        } catch (AuthenticationException e) {
            log.warn("Failed login attempt for email: {}", request.email());
            throw new BusinessException(INVALID_CREDENTIALS);
        }
    }

    public LoginResponse refresh(String refreshToken) {
        String subject = tokenService.validateRefreshToken(refreshToken);

        if (subject == null) {
            log.warn("Invalid or expired refresh token received");
            throw new BusinessException(TOKEN_INVALID_OR_EXPIRED);
        }

        try {
            Long userId = Long.valueOf(subject);
            var user = repository.findById(userId)
                    .orElseThrow(() -> new BusinessException(USER_NOT_FOUND));

            return new LoginResponse(
                    tokenService.generateAccessToken(user),
                    tokenService.generateRefreshToken(user), user.getName()
            );
        } catch (NumberFormatException e) {
            throw new BusinessException(TOKEN_INVALID_OR_EXPIRED);
        }
    }

    public MessageResponse forgotPassword(EmailRequest request) {
        repository.findByEmail(request.email()).ifPresent(user -> {
            String token = tokenService.generatePasswordResetToken(user);

            emailService.sendEmail(user.getEmail(), PASSWORD_RESET, Map.of(
                    "name", user.getName(),
                    "appUrl", appUrl + "/reset-password?token=" + token,
                    EXPIRATION_HOURS, 1
            ));
        });

        return new MessageResponse(PASSWORD_RESET.getMessage());
    }

    public MessageResponse resetPassword(ResetPasswordRequest request) {
        String email = tokenService.validatePasswordResetToken(request.token());

        if (email == null) {
            throw new BusinessException(TOKEN_INVALID_OR_EXPIRED);
        }

        var user = repository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(USER_NOT_FOUND));

        user.setPassword(passwordEncoder.encode(request.password()));
        repository.save(user);

        emailService.sendEmail(user.getEmail(), PASSWORD_CHANGED, Map.of(
                "name", user.getName()
        ));

        return new MessageResponse(PASSWORD_CHANGED.getMessage());
    }
}