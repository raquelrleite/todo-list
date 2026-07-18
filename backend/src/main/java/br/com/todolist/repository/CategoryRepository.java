package br.com.todolist.repository;

import br.com.todolist.model.Category;
import br.com.todolist.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository <Category, UUID>{

    Optional <Category> findByTitleAndUser(String title, User user);
    Optional <Category> findByIdAndUser(UUID id, User user);
    Page<Category> findAllByUser(User user, Pageable pageable);
    boolean existsByTitleAndUser(String title, User user);

}
