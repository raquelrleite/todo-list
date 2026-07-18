package br.com.todolist.controller;

import br.com.todolist.dto.request.TaskCreateRequest;
import br.com.todolist.dto.request.TaskUpdateRequest;
import br.com.todolist.dto.response.TaskResponse;
import br.com.todolist.infra.oauth2.AuthenticatedUser;
import br.com.todolist.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v1/tasks")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class TaskController {

    private final TaskService service;

    @PostMapping
    public TaskResponse create(@RequestBody @Valid TaskCreateRequest request,
                                   @AuthenticationPrincipal AuthenticatedUser authenticated) {
        log.info("User {} is creating a task", authenticated.user().getEmail());
        return service.create(request, authenticated.user());
    }

    @GetMapping
    public Page<TaskResponse> findAll(@RequestParam boolean done, 
                                      @PageableDefault(size = 20) Pageable pageable, 
                                      @AuthenticationPrincipal AuthenticatedUser authenticated) {
        log.info("User {} is finding all tasks with done={}", authenticated.user().getEmail(), done);
        return service.findAll(done, authenticated.user(), pageable);
    }

    @GetMapping("/title/{title}")
    public Page<TaskResponse> findByTitle(@PathVariable String title,
                                          @PageableDefault(size = 20) Pageable pageable,
                                          @AuthenticationPrincipal AuthenticatedUser authenticated) {
        log.info("User {} is finding tasks by title: {}", authenticated.user().getEmail(), title);
        return service.findByTitle(title, authenticated.user(), pageable);
    }

    @GetMapping("/category/{id}")
    public Page<TaskResponse> findByCategory(@PathVariable UUID id,  
                                             @PageableDefault(size = 20) Pageable pageable,
                                             @AuthenticationPrincipal AuthenticatedUser authenticated) {
        log.info("User {} is finding tasks by category ID: {}", authenticated.user().getEmail(), id);
        return service.findByCategory(id, authenticated.user(), pageable);
    }

    @PatchMapping("/{id}")
    public TaskResponse update(@PathVariable UUID id,
                               @RequestBody @Valid TaskUpdateRequest request,
                               @AuthenticationPrincipal AuthenticatedUser authenticated) {
        log.info("User {} is updating task ID: {}", authenticated.user().getEmail(), id);
        return service.update(id, request, authenticated.user());
    }

    @PatchMapping("/complete/{id}")
    public TaskResponse complete(@PathVariable UUID id,
                                 @AuthenticationPrincipal AuthenticatedUser authenticated) {
        log.info("User {} is toggling completion for task ID: {}", authenticated.user().getEmail(), id);
        return service.complete(id, authenticated.user());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id,
                       @AuthenticationPrincipal AuthenticatedUser authenticated) {
        log.info("User {} is deleting task ID: {}", authenticated.user().getEmail(), id);
        service.delete(id, authenticated.user());
    }
}