package br.com.todolist.infra.oauth2;

import br.com.todolist.infra.security.TokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;

import java.io.IOException;
import java.util.Objects;

import static java.net.URLEncoder.encode;
import static java.nio.charset.StandardCharsets.UTF_8;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final TokenService tokenService;

    @Value("${app.url}")
    private String appUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        if (!(authentication.getPrincipal() instanceof OAuth2UserPrincipal principal)) {
            log.error("Unexpected principal type: {}",
                    Objects.requireNonNull(authentication.getPrincipal()).getClass());
            response.sendRedirect(appUrl + "/login?error=oauth2");
            return;
        }

        var user = principal.user();
        String accessToken = tokenService.generateAccessToken(user);
        String refreshToken = tokenService.generateRefreshToken(user);

        log.info("OAuth2 login successful for userId={} provider={}", user.getId(), user.getProvider());

        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("accessToken", accessToken, 60 * 60, true));
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("refreshToken", refreshToken, 60 * 60 * 24 * 7, true));
        response.addHeader(HttpHeaders.SET_COOKIE,
                buildCookie("userName", encode(user.getName(), UTF_8).replace("+", "%20"), 60 * 60 * 24 * 7, false));

        response.sendRedirect(appUrl + "/oauth2/callback");
    }

    private String buildCookie(String name, String value, int maxAgeSeconds, boolean httpOnly) {
        return ResponseCookie.from(name, value)
                .httpOnly(httpOnly)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("Strict")
                .build().toString();
    }
}