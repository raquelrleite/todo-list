package br.com.todolist.repository;

import br.com.todolist.model.Category;
import br.com.todolist.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository <Category, Long>{

    Optional <Category> findByTitleAndUser(String title, User user);
    Optional <Category> findByIdAndUser(Long id, User user);
    Page<Category> findAllByUser(User user, Pageable pageable);
    boolean existsByTitleAndUser(String title, User user);

}
