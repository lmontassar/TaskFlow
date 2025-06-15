package com.taskflow.server.Repositories;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.taskflow.server.Entities.Message;
import com.taskflow.server.Entities.Project;
import java.util.List;


@Repository
public interface MessageRepository extends MongoRepository<Message, String>{
    public List<Message> findByProject(Project project);
}
