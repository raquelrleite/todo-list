package br.com.todolist.mapper;

import br.com.todolist.dto.request.UserRequest;
import br.com.todolist.dto.response.UserResponse;
import br.com.todolist.model.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    User toEntity(UserRequest request);

    UserResponse toResponse(User user);
}
