package com.taskflow.server.Repositories;

import com.taskflow.server.Entities.Project;

import org.bson.Document;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.taskflow.server.Entities.Tache;
import com.taskflow.server.Entities.User;

import java.util.List;
import java.util.Map;

@Repository
public interface TacheRepository extends MongoRepository<Tache, String> {
    public List<Tache> getAllByProject(Project p);

    public List<Tache> findByAssigneeContainingOrRapporteur(User u, User u2);

    public List<Tache> getAllByParent(Tache t);

    List<Tache> findAllByPrecedentesContains(Tache tache);

    List<Tache> findAllByParallelesContains(Tache tache);

    @Aggregation(pipeline = {
        "{ \"$match\": { \"$expr\": { \"$eq\": [ \"$project.$id\", { \"$toObjectId\": ?0 } ] } }",
        "{ \"$group\": { \"_id\": null, \"tasks\": { \"$sum\": 1 }, \"completed\": { \"$sum\": { \"$cond\": [ { \"$eq\": [ \"$statut\", \"DONE\" ] }, 1, 0 ] } } }"
    })
    Map<String, Object> getStatsByProject(String projectId);

    public List<Tache> findAllByStatut(Tache.Statut statut);

}
