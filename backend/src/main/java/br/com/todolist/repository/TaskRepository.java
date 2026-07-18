package br.com.todolist.repository;

import br.com.todolist.model.Task;
import br.com.todolist.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    Page<Task> findByTitleAndUser(String title, User user, Pageable pageable);
    Optional<Task> findByIdAndUser(UUID id, User user);
    Page<Task> findByDoneAndUser(boolean done, User user, Pageable pageable);
    Page<Task> findByCategoryIdAndUser(UUID id, User user, Pageable pageable);

}
