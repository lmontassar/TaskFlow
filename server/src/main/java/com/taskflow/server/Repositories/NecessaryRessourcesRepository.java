package com.taskflow.server.Repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.taskflow.server.Entities.NecessaryRessource;

@Repository
public interface NecessaryRessourcesRepository extends MongoRepository<NecessaryRessource,String>{
}
