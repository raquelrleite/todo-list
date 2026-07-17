package br.com.todolist.controller;

import br.com.todolist.dto.request.TaskCreateRequest;
import br.com.todolist.dto.request.TaskUpdateRequest;
import br.com.todolist.dto.response.TaskResponse;
import br.com.todolist.infra.oauth2.AuthenticatedUser;
import br.com.todolist.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/tasks")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class TaskController {

    private final TaskService service;

    @PostMapping
    public TaskResponse create(@RequestBody @Valid TaskCreateRequest request,
                                   @AuthenticationPrincipal AuthenticatedUser authenticated) {
        return service.create(request, authenticated.user());
    }

    @GetMapping
    public Page<TaskResponse> findAll(@RequestParam boolean done, 
                                      @PageableDefault(size = 20) Pageable pageable, 
                                      @AuthenticationPrincipal AuthenticatedUser authenticated) {
        return service.findAll(done, authenticated.user(), pageable);
    }

    @GetMapping("/title/{title}")
    public Page<TaskResponse> findByTitle(@PathVariable String title,
                                          @PageableDefault(size = 20) Pageable pageable,
                                          @AuthenticationPrincipal AuthenticatedUser authenticated) {
        return service.findByTitle(title, authenticated.user(), pageable);
    }

    @GetMapping("/category/{id}")
    public Page<TaskResponse> findByCategory(@PathVariable Long id,  
                                             @PageableDefault(size = 20) Pageable pageable,
                                             @AuthenticationPrincipal AuthenticatedUser authenticated) {
        return service.findByCategory(id, authenticated.user(), pageable);
    }

    @PatchMapping("/{id}")
    public TaskResponse update(@PathVariable Long id,
                               @RequestBody @Valid TaskUpdateRequest request,
                               @AuthenticationPrincipal AuthenticatedUser authenticated) {
        return service.update(id, request, authenticated.user());
    }

    @PatchMapping("/complete/{id}")
    public TaskResponse complete(@PathVariable Long id,
                                 @AuthenticationPrincipal AuthenticatedUser authenticated) {
        return service.complete(id, authenticated.user());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal AuthenticatedUser authenticated) {
        service.delete(id, authenticated.user());
    }
}