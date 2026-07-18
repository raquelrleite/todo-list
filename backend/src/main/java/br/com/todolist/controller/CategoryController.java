package br.com.todolist.controller;

import br.com.todolist.dto.request.CategoryRequest;
import br.com.todolist.dto.response.CategoryResponse;
import br.com.todolist.infra.oauth2.AuthenticatedUser;
import br.com.todolist.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v1/categories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class CategoryController {

    private final CategoryService service;

    @PostMapping
    public CategoryResponse create(@RequestBody @Valid CategoryRequest request, @AuthenticationPrincipal AuthenticatedUser authenticated){
        log.info("User {} is creating a category", authenticated.user().getEmail());
        return service.create(request, authenticated.user());
    }

    @GetMapping("/{title}")
    public List<CategoryResponse> findByTitle(@PathVariable String title, @AuthenticationPrincipal AuthenticatedUser authenticated){
        log.info("User {} is finding categories by title: {}", authenticated.user().getEmail(), title);
        return service.findByTitle(title, authenticated.user());
    }

    @GetMapping
    public Page<CategoryResponse> findAll(@PageableDefault(size = 20) Pageable pageable, 
                                          @AuthenticationPrincipal AuthenticatedUser authenticated){
        log.info("User {} is finding all categories", authenticated.user().getEmail());
        return service.findAll(authenticated.user(), pageable);
    }

    @PatchMapping("/{id}")
    public CategoryResponse update(@PathVariable UUID id, @RequestBody @Valid CategoryRequest request, @AuthenticationPrincipal AuthenticatedUser authenticated){
        log.info("User {} is updating category ID: {}", authenticated.user().getEmail(), id);
        return service.update(id, request, authenticated.user());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser authenticated){
        log.info("User {} is deleting category ID: {}", authenticated.user().getEmail(), id);
        service.delete(id, authenticated.user());
    }

}
