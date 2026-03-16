package br.com.todolist.mapper;

import br.com.todolist.dto.request.CategoryRequest;
import br.com.todolist.dto.response.CategoryResponse;
import br.com.todolist.model.Category;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    Category toEntity (CategoryRequest request);
    CategoryResponse toResponse(Category category);
    Category updateEntity(CategoryRequest request, @MappingTarget Category entity);// pega o que tá no request e seta na entidade que já existe



}
