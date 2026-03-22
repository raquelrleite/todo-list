package br.com.todolist.infra.oauth2;

import br.com.todolist.model.User;

public interface AuthenticatedUser {
    User user();
}