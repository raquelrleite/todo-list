package br.com.todolist.repository;

import br.com.todolist.model.Task;
import br.com.todolist.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    Page<Task> findByTitleAndUser(String title, User user, Pageable pageable);
    Optional<Task> findByIdAndUser(Long id, User user);
    Page<Task> findByDoneAndUser(boolean done, User user, Pageable pageable);
    Page<Task> findByCategoryIdAndUser(Long id, User user, Pageable pageable);

}
