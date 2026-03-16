package br.com.todolist.controller;

import br.com.todolist.dto.request.CategoryRequest;
import br.com.todolist.dto.response.CategoryResponse;
import br.com.todolist.infra.security.UserDetailsImpl;
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
    public CategoryResponse create(@RequestBody @Valid CategoryRequest request, @AuthenticationPrincipal UserDetailsImpl userDetails){
        return service.create(request, userDetails.user());
    }

    @GetMapping("/{title}")
    public List<CategoryResponse> findByTitle(@PathVariable String title, @AuthenticationPrincipal UserDetailsImpl userDetails){
        return service.findByTitle(title, userDetails.user());
    }

    @GetMapping
    public List<CategoryResponse> findAll(@AuthenticationPrincipal UserDetailsImpl userDetails){
        return service.findAll(userDetails.user());
    }

    @PatchMapping("/{id}")
    public CategoryResponse update(@PathVariable Long id, @RequestBody @Valid CategoryRequest request, @AuthenticationPrincipal UserDetailsImpl userDetails){
        return service.update(id, request, userDetails.user());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl userDetails){
        service.delete(id, userDetails.user());
    }

}
