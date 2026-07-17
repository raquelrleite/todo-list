package br.com.todolist.service;

import br.com.todolist.dto.request.TaskCreateRequest;
import br.com.todolist.dto.request.TaskUpdateRequest;
import br.com.todolist.dto.response.TaskResponse;
import br.com.todolist.exception.BusinessException;
import br.com.todolist.mapper.TaskMapper;
import br.com.todolist.model.Category;
import br.com.todolist.model.User;
import br.com.todolist.repository.CategoryRepository;
import br.com.todolist.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static br.com.todolist.enums.ErrorCode.CATEGORY_NOT_FOUND;
import static br.com.todolist.enums.ErrorCode.TASK_NOT_FOUND;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository repository;
    private final TaskMapper mapper;
    private final CategoryRepository categoryRepository;

    public TaskResponse create(TaskCreateRequest request, User user) {
        var task = mapper.toEntity(request);
        task.setUser(user);

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new BusinessException(CATEGORY_NOT_FOUND));
            task.setCategory(category);
        }

        repository.save(task);
        return mapper.toResponse(task);
    }

    public Page<TaskResponse> findByTitle(String title, User user, Pageable pageable) {
        return repository.findByTitleAndUser(title, user, pageable)
                .map(mapper::toResponse);
    }

    public Page<TaskResponse> findAll(boolean done, User user, Pageable pageable) {
        return repository.findByDoneAndUser(done, user, pageable)
                .map(mapper::toResponse);
    }

    public TaskResponse update(Long id, TaskUpdateRequest request, User user) {
        var task = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new BusinessException(TASK_NOT_FOUND));

        mapper.updateEntity(request, task);

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new BusinessException(CATEGORY_NOT_FOUND));
            task.setCategory(category);
        }

        repository.save(task);
        return mapper.toResponse(task);
    }

    public Page<TaskResponse> findByCategory(Long id, User user, Pageable pageable) {
        return repository.findByCategoryIdAndUser(id, user, pageable)
                .map(mapper::toResponse);
    }

    public TaskResponse complete(Long id, User user) {
        var task = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new BusinessException(TASK_NOT_FOUND));

        task.setDone(!task.isDone());
        repository.save(task);
        return mapper.toResponse(task);
    }

    public void delete(Long id, User user) {
        var task = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new BusinessException(TASK_NOT_FOUND));
        task.setDeleted(true);
        repository.save(task);
    }
}