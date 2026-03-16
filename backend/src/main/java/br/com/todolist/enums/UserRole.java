package br.com.todolist.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Set;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public enum UserRole {
    USER(Set.of(
            br.com.todolist.enums.UserPermission.DATA_READ,
            br.com.todolist.enums.UserPermission.DATA_WRITE,
            br.com.todolist.enums.UserPermission.USER_MANAGEMENT,
            br.com.todolist.enums.UserPermission.ADMIN_ACCESS
    ));

    private final Set<br.com.todolist.enums.UserPermission> permissions;

    public Set<SimpleGrantedAuthority> getGrantedAuthorities() {
        Set<SimpleGrantedAuthority> authorities = permissions.stream()
                .map(p -> new SimpleGrantedAuthority(p.getPermission()))
                .collect(Collectors.toSet());

        authorities.add(new SimpleGrantedAuthority("ROLE_" + this.name()));
        return authorities;
    }
}