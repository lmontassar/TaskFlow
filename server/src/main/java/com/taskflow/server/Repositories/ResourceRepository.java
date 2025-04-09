package com.taskflow.server.Repositories;

import com.taskflow.server.Entities.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
}
