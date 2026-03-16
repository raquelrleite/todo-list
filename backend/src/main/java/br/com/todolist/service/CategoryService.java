package br.com.todolist.service;

import br.com.todolist.dto.request.CategoryRequest;
import br.com.todolist.dto.response.CategoryResponse;
import br.com.todolist.dto.response.TaskResponse;
import br.com.todolist.mapper.CategoryMapper;
import br.com.todolist.model.Category;
import br.com.todolist.model.Task;
import br.com.todolist.model.User;
import br.com.todolist.repository.CategoryRepository;
import br.com.todolist.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import static br.com.todolist.enums.ErrorCode.CATEGORY_ALREADY_EXISTS;
import static br.com.todolist.enums.ErrorCode.CATEGORY_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository repository;
    private final CategoryMapper mapper;
    private final TaskService taskService;

    public CategoryResponse create(CategoryRequest request, User user) {
        if (repository.existsByTitleAndUser(request.title(), user)) {
            throw new BusinessException(CATEGORY_ALREADY_EXISTS);
        }

        var category = mapper.toEntity(request);
        category.setUser(user);
        repository.save(category);
        return mapper.toResponse(category);
    }

    public List<CategoryResponse> findByTitle(String title, User user) {
        return repository.findByTitleAndUser(title, user)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<CategoryResponse> findAll(User user) {
        return repository.findAllByUser(user)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public CategoryResponse update(Long id, CategoryRequest request, User user) {
        Category category = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new BusinessException(CATEGORY_NOT_FOUND));

        mapper.updateEntity(request, category);
        repository.save(category);
       return mapper.toResponse(category);
    }

    public void delete(Long id, User user) {
        var category = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new BusinessException(CATEGORY_NOT_FOUND));
        repository.delete(category);
    }
}
