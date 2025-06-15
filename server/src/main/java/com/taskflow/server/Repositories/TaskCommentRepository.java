package com.taskflow.server.Repositories;
import com.taskflow.server.Entities.Tache;
import com.taskflow.server.Entities.TaskComment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskCommentRepository extends MongoRepository<TaskComment,String> {
    public List<TaskComment> findAllByTaskOrderByCreatedAtDesc(Tache tache);
}
