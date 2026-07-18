package br.com.todolist.infra.security;

import br.com.todolist.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

import static java.util.Arrays.stream;

@Slf4j
@Component
@RequiredArgsConstructor
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UserRepository repository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        var token = recoverTokenFromHeader(request);
        if (token == null) {
            token = recoverTokenFromCookie(request);
        }

        if (token == null) {
            log.debug("No JWT token found in request to {}", request.getRequestURI());
        } else {
            log.debug("JWT token found in request to {}", request.getRequestURI());
            String subject = tokenService.validateAccessToken(token);

            if (subject != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    UUID id = UUID.fromString(subject);
                    var userOptional = repository.findById(id);

                    if (userOptional.isPresent()) {
                        var user = userOptional.get();
                        var userDetails = new UserDetailsImpl(user);
                        var authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities()
                        );
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                } catch (IllegalArgumentException e) {
                    log.warn("Token with non-UUID subject rejected: {}", subject);
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String recoverTokenFromHeader(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        return authHeader.substring(7);
    }

    private String recoverTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return stream(request.getCookies())
                .filter(c -> "accessToken".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}