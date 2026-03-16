package br.com.todolist.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum UserPermission {
    DATA_READ("data:read"),
    DATA_WRITE("data:write"),
    USER_MANAGEMENT("user:management"),
    ADMIN_ACCESS("admin:access");

    private final String permission;
}
