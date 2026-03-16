package br.com.todolist.controller;

import br.com.todolist.dto.request.TaskCreateRequest;
import br.com.todolist.dto.request.TaskUpdateRequest;
import br.com.todolist.dto.response.TaskResponse;
import br.com.todolist.infra.security.UserDetailsImpl;
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
                                   @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return service.create(request, userDetails.user());
    }

    @GetMapping
    public List<TaskResponse> findAll(@RequestParam boolean done, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return service.findAll(done, userDetails.user());
    }

    @GetMapping("/title/{title}")
    public List<TaskResponse> findByTitle(@PathVariable String title,
                                          @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return service.findByTitle(title, userDetails.user());
    }

    @GetMapping("/category/{id}")
    public List<TaskResponse> findByCategory(@PathVariable Long id,  @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return service.findByCategory(id, userDetails.user());
    }

    @PatchMapping("/{id}")
    public TaskResponse update(@PathVariable Long id,
                               @RequestBody @Valid TaskUpdateRequest request,
                               @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return service.update(id, request, userDetails.user());
    }

    @PatchMapping("/complete/{id}")
    public TaskResponse complete(@PathVariable Long id,
                                 @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return service.complete(id, userDetails.user());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal UserDetailsImpl userDetails) {
        service.delete(id, userDetails.user());
    }
}