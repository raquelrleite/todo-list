package br.com.todolist.controller;

import br.com.todolist.dto.request.TaskCreateRequest;
import br.com.todolist.dto.request.TaskUpdateRequest;
import br.com.todolist.dto.response.TaskResponse;
import br.com.todolist.infra.oauth2.AuthenticatedUser;
import br.com.todolist.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public List<TaskResponse> findAll(@RequestParam boolean done, @AuthenticationPrincipal AuthenticatedUser authenticated) {
        return service.findAll(done, authenticated.user());
    }

    @GetMapping("/title/{title}")
    public List<TaskResponse> findByTitle(@PathVariable String title,
                                          @AuthenticationPrincipal AuthenticatedUser authenticated) {
        return service.findByTitle(title, authenticated.user());
    }

    @GetMapping("/category/{id}")
    public List<TaskResponse> findByCategory(@PathVariable Long id,  @AuthenticationPrincipal AuthenticatedUser authenticated) {
        return service.findByCategory(id, authenticated.user());
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