package com.taskflow.server.Repositories;

import com.taskflow.server.Entities.Tache;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskCommentRepository extends MongoRepository<Tache,String> {
}
