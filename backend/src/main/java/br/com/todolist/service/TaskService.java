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
import org.springframework.stereotype.Service;

import java.util.List;

import static br.com.todolist.enums.ErrorCode.CATEGORY_NOT_FOUND;
import static br.com.todolist.enums.ErrorCode.TASK_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository repository;
    private final TaskMapper mapper;
    private final CategoryRepository categoryRepository;

    public TaskResponse create(TaskCreateRequest request, User user) {
        var task = mapper.toEntity(request);
        task.setUser(user);
        repository.save(task);
        return mapper.toResponse(task);
    }

    public List<TaskResponse> findByTitle(String title, User user) {
        return repository.findByTitleAndUser(title, user)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<TaskResponse> findAll(boolean done, User user) {
        return repository.findByDoneAndUser(done, user)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public TaskResponse update(Long id, TaskUpdateRequest request, User user) {
        var task = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new BusinessException(TASK_NOT_FOUND));

        mapper.updateEntity(request, task);

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new BusinessException(CATEGORY_NOT_FOUND));
            task.setCategory(category);
        }else {
            task.setCategory(null);
        }

        repository.save(task);
        return mapper.toResponse(task);
    }

    public List<TaskResponse> findByCategory(Long id, User user) {
        return repository.findByCategoryIdAndUser(id, user)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public TaskResponse complete(Long id, User user) {
        var task = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new BusinessException(TASK_NOT_FOUND));

        task.setDone(true);
        repository.save(task);
        return mapper.toResponse(task);
    }

    public void delete(Long id, User user) {
        var task = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new BusinessException(TASK_NOT_FOUND));
        repository.delete(task);
    }
}