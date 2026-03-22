package br.com.todolist.infra.oauth2;

import br.com.todolist.enums.AuthProvider;
import br.com.todolist.enums.UserRole;
import br.com.todolist.model.User;
import br.com.todolist.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

import static br.com.todolist.enums.AuthProvider.GITHUB;
import static br.com.todolist.enums.AuthProvider.GOOGLE;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        String providerId = extractProviderId(oAuth2User, provider);
        String email = extractEmail(oAuth2User, userRequest, provider);
        String name = extractName(oAuth2User, provider);

        if (email == null) {
            log.warn("OAuth2 login without public email for provider={} providerId={}", provider, providerId);
            throw new OAuth2AuthenticationException("email_not_available");
        }

        var user = userRepository.findByEmail(email)
                .map(existing -> updateExistingUser(existing, provider, providerId, name))
                .orElseGet(() -> createNewUser(email, name, provider, providerId));

        return new OAuth2UserPrincipal(user, oAuth2User.getAttributes());
    }

    private User updateExistingUser(User user, AuthProvider provider, String providerId, String name) {
        boolean changed = false;

        if (name != null && !name.equals(user.getName())) {
            user.setName(name);
            changed = true;
        }

        if (!provider.equals(user.getProvider())) {
            log.info("Linking provider={} to existing user email={}", provider, user.getEmail());
            user.setProvider(provider);
            user.setProviderId(providerId);
            changed = true;
        }

        return changed ? userRepository.save(user) : user;
    }

    private User createNewUser(String email, String name, AuthProvider provider, String providerId) {
        log.info("Creating new user via OAuth2: provider={} email={}", provider, email);
        var user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setRole(UserRole.USER);
        user.setProvider(provider);
        user.setProviderId(providerId);
        user.setPassword(null);
        user.setVerified(true);
        return userRepository.save(user);
    }

    private String extractProviderId(OAuth2User user, AuthProvider provider) {
        Object id = (provider == GOOGLE) ? user.getAttribute("sub") : user.getAttribute("id");
        return id != null ? id.toString() : null;
    }

    private String extractEmail(OAuth2User user, OAuth2UserRequest userRequest, AuthProvider provider) {
        String email = user.getAttribute("email");
        if (email != null) return email;

        if (provider == GITHUB) {
            String token = userRequest.getAccessToken().getTokenValue();
            try {
                RestClient restClient = RestClient.create();
                List<Map<String, Object>> emails = restClient.get()
                        .uri("https://api.github.com/user/emails")
                        .header("Authorization", "Bearer " + token)
                        .retrieve()
                        .body(new ParameterizedTypeReference<>() {});

                if (emails != null) {
                    return emails.stream()
                            .filter(e -> Boolean.TRUE.equals(e.get("primary")) && Boolean.TRUE.equals(e.get("verified")))
                            .map(e -> (String) e.get("email"))
                            .findFirst()
                            .orElse(null);
                }
            } catch (Exception e) {
                log.error("Failed to fetch GitHub emails", e);
            }
        }
        return null;
    }

    private String extractName(OAuth2User user, AuthProvider provider) {
        String name = user.getAttribute("name");
        if (provider == GITHUB && name == null) {
            return user.getAttribute("login");
        }
        return name;
    }
}