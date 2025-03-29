package com.taskflow.server.Repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.taskflow.server.Entities.Tache;

@Repository
public interface TacheRepository extends MongoRepository<Tache,String>{
    
}
