package br.com.todolist.controller;

import br.com.todolist.dto.request.CategoryRequest;
import br.com.todolist.dto.response.CategoryResponse;
import br.com.todolist.infra.oauth2.AuthenticatedUser;
import br.com.todolist.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/categories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class CategoryController {

    private final CategoryService service;

    @PostMapping
    public CategoryResponse create(@RequestBody @Valid CategoryRequest request, @AuthenticationPrincipal AuthenticatedUser authenticated){
        return service.create(request, authenticated.user());
    }

    @GetMapping("/{title}")
    public List<CategoryResponse> findByTitle(@PathVariable String title, @AuthenticationPrincipal AuthenticatedUser authenticated){
        return service.findByTitle(title, authenticated.user());
    }

    @GetMapping
    public List<CategoryResponse> findAll(@AuthenticationPrincipal AuthenticatedUser authenticated){
        return service.findAll(authenticated.user());
    }

    @PatchMapping("/{id}")
    public CategoryResponse update(@PathVariable Long id, @RequestBody @Valid CategoryRequest request, @AuthenticationPrincipal AuthenticatedUser authenticated){
        return service.update(id, request, authenticated.user());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser authenticated){
        service.delete(id, authenticated.user());
    }

}
