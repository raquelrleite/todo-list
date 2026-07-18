package br.com.todolist.service;

import br.com.todolist.dto.request.CategoryRequest;
import br.com.todolist.dto.response.CategoryResponse;
import br.com.todolist.exception.BusinessException;
import br.com.todolist.mapper.CategoryMapper;
import br.com.todolist.model.Category;
import br.com.todolist.model.User;
import br.com.todolist.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static br.com.todolist.enums.ErrorCode.CATEGORY_ALREADY_EXISTS;
import static br.com.todolist.enums.ErrorCode.CATEGORY_NOT_FOUND;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository repository;
    private final CategoryMapper mapper;

    public CategoryResponse create(CategoryRequest request, User user) {
        log.info("Creating category with title: {} for user: {}", request.title(), user.getEmail());
        if (repository.existsByTitleAndUser(request.title(), user)) {
            log.warn("Category with title {} already exists for user: {}", request.title(), user.getEmail());
            throw new BusinessException(CATEGORY_ALREADY_EXISTS);
        }

        var category = mapper.toEntity(request);
        category.setUser(user);
        repository.save(category);
        return mapper.toResponse(category);
    }

    public List<CategoryResponse> findByTitle(String title, User user) {
        log.info("Finding categories by title: {} for user: {}", title, user.getEmail());
        return repository.findByTitleAndUser(title, user)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public Page<CategoryResponse> findAll(User user, Pageable pageable) {
        log.info("Finding all categories for user: {}", user.getEmail());
        return repository.findAllByUser(user, pageable)
                .map(mapper::toResponse);
    }

    public CategoryResponse update(UUID id, CategoryRequest request, User user) {
        log.info("Updating category ID: {} for user: {}", id, user.getEmail());
        Category category = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new BusinessException(CATEGORY_NOT_FOUND));

        mapper.updateEntity(request, category);
        repository.save(category);
       return mapper.toResponse(category);
    }

    public void delete(UUID id, User user) {
        log.info("Deleting category ID: {} for user: {}", id, user.getEmail());
        var category = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new BusinessException(CATEGORY_NOT_FOUND));
        repository.delete(category);
    }
}
