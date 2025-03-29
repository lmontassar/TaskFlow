package com.taskflow.server.Repositories;

import com.taskflow.server.Entities.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.taskflow.server.Entities.Tache;

import java.util.List;

@Repository
public interface TacheRepository extends MongoRepository<Tache,String>{
    public List<Tache> getAllByProject(Project p);
}
