package br.com.todolist.infra.security;

import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {


    private static final int MAX_ATTEMPT = 5;
    private final ConcurrentHashMap<String, Integer> attemptsCache = new ConcurrentHashMap<>();

    public void loginSucceeded(String key) {
        attemptsCache.remove(key);
    }

    public void loginFailed(String key) {
        int attempts = attemptsCache.getOrDefault(key, 0);
        attempts++;
        attemptsCache.put(key, attempts);
    }

    public boolean isBlocked(String key) {
        return attemptsCache.getOrDefault(key, 0) >= MAX_ATTEMPT;
    }

    @Scheduled(fixedRate = 3600000) // 1 hora
    public void clearCache() {
        attemptsCache.clear();
    }
}
