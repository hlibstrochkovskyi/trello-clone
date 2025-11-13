package com.example.trello_clone.repository;

import com.example.trello_clone.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {

}