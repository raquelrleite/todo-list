package br.com.todolist.mapper;

import br.com.todolist.dto.request.TaskCreateRequest;
import br.com.todolist.dto.response.TaskResponse;
import br.com.todolist.dto.request.TaskUpdateRequest;
import br.com.todolist.model.Task;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface TaskMapper {

    @Mapping(target = "category", ignore = true)
    Task toEntity(TaskCreateRequest request);

    @Mapping(target = "categoryId", source = "category.id")
    TaskResponse toResponse(Task task);

    @Mapping(target = "category", ignore = true)
    Task updateEntity(TaskUpdateRequest request, @MappingTarget Task entity);
}
