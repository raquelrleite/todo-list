package br.com.todolist.infra.security;

import br.com.todolist.exception.BusinessException;
import br.com.todolist.model.User;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static br.com.todolist.enums.ErrorCode.TOKEN_GENERATION_ERROR;

@Service
public class TokenService {

    private static final String ISSUER = "todolist";

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-minutes}")
    private long expirationMinutes;

    @Value("${jwt.refresh-expiration-days}")
    private long refreshExpirationDays;

    @Value("${jwt.confirmation-expiration-hours}")
    private long confirmationExpirationHours;

    private Algorithm algorithm;

    @PostConstruct
    private void init() {
        this.algorithm = Algorithm.HMAC512(secret);
    }

    public String generateAccountConfirmationToken(User user) {
        try {
            return JWT.create()
                    .withIssuer(ISSUER)
                    .withSubject(user.getEmail())
                    .withClaim("type", "account-confirmation")
                    .withExpiresAt(generateExpirationDate(confirmationExpirationHours, ChronoUnit.HOURS))
                    .sign(algorithm);
        } catch (JWTCreationException e) {
            throw new BusinessException(TOKEN_GENERATION_ERROR);
        }
    }

    public String validateAccountConfirmationToken(String token) {
        try {
            return JWT.require(algorithm)
                    .withIssuer(ISSUER)
                    .withClaim("type", "account-confirmation")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException e) {
            return null;
        }
    }

    public String generateAccessToken(User user) {
        try {
            return JWT.create()
                    .withIssuer(ISSUER)
                    .withSubject(user.getId().toString())
                    .withClaim("type", "access")
                    .withExpiresAt(generateExpirationDate(expirationMinutes, ChronoUnit.MINUTES))
                    .sign(algorithm);
        } catch (JWTCreationException e) {
            throw new BusinessException(TOKEN_GENERATION_ERROR);
        }
    }

    public String validateAccessToken(String token) {
        try {
            return JWT.require(algorithm)
                    .withIssuer(ISSUER)
                    .withClaim("type", "access")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException e) {
            return null;
        }
    }

    public String generateRefreshToken(User user) {
        try {
            return JWT.create()
                    .withIssuer(ISSUER)
                    .withSubject(user.getId().toString())
                    .withClaim("type", "refresh")
                    .withExpiresAt(generateExpirationDate(refreshExpirationDays, ChronoUnit.DAYS))
                    .sign(algorithm);
        } catch (JWTCreationException e) {
            throw new BusinessException(TOKEN_GENERATION_ERROR);
        }
    }

    public String validateRefreshToken(String token) {
        try {
            return JWT.require(algorithm)
                    .withIssuer(ISSUER)
                    .withClaim("type", "refresh")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException e) {
            return null;
        }
    }

    public String generatePasswordResetToken(User user) {
        try {
            return JWT.create()
                    .withIssuer(ISSUER)
                    .withSubject(user.getEmail())
                    .withClaim("type", "password-reset")
                    .withExpiresAt(generateExpirationDate(1, ChronoUnit.HOURS))
                    .sign(algorithm);
        } catch (JWTCreationException e) {
            throw new BusinessException(TOKEN_GENERATION_ERROR);
        }
    }

    public String validatePasswordResetToken(String token) {
        try {
            return JWT.require(algorithm)
                    .withIssuer(ISSUER)
                    .withClaim("type", "password-reset")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException e) {
            return null;
        }
    }

    private Instant generateExpirationDate(long time, ChronoUnit unit) {
        return Instant.now().plus(time, unit);
    }
}