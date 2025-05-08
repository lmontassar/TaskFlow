package com.taskflow.server.Repositories;

import com.taskflow.server.Entities.AIChat;
import com.taskflow.server.Entities.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AIChatRepository extends MongoRepository<AIChat, String> {
    public AIChat getById(String id);
    public List<AIChat> getAllByProjectAndUser(String id,String userId);
}
