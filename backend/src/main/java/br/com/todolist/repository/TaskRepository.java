package br.com.todolist.repository;

import br.com.todolist.model.Task;
import br.com.todolist.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByTitleAndUser(String title, User user);
    Optional<Task> findByIdAndUser(Long id, User user);
    List<Task> findByDoneAndUser(boolean done, User user);
    List<Task> findByCategoryIdAndUser(Long id, User user);

}
