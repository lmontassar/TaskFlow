package com.taskflow.server.Repositories;

import com.taskflow.server.Entities.DTO.MonthlyTaskDurationDTO;
import com.taskflow.server.Entities.Project;

import org.bson.Document;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.taskflow.server.Entities.Tache;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Entities.DTO.ProjectStatsDTO;
import com.taskflow.server.Entities.DTO.TasksStatsDTO;

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
            // 1) Match only the given project
            "{ '$match':   { '$expr': { '$eq': [ '$project.$id', { '$toObjectId': ?0 } ] } } }",
            // 2) Group and sum up each statut
            "{ '$group':   {"
                    + " '_id':      null,"
                    + " 'tasks':    { '$sum': 1 },"
                    + " 'completed':{ '$sum': { '$cond': [ { '$eq': [ '$statut', 'DONE'     ] }, 1, 0 ] } },"
                    + " 'todo':     { '$sum': { '$cond': [ { '$eq': [ '$statut', 'TODO'     ] }, 1, 0 ] } },"
                    + " 'progress': { '$sum': { '$cond': [ { '$eq': [ '$statut', 'PROGRESS' ] }, 1, 0 ] } },"
                    + " 'review':   { '$sum': { '$cond': [ { '$eq': [ '$statut', 'REVIEW'   ] }, 1, 0 ] } }"
                    + " } }",
            // 3) Drop the pseudo‐_id and expose only the counts
            "{ '$project': {"
                    + " '_id':     0,"
                    + " 'tasks':   1,"
                    + " 'completed':1,"
                    + " 'todo':    1,"
                    + " 'progress':1,"
                    + " 'review':  1"
                    + " } }"
    })
    ProjectStatsDTO getStatsByProject(String projectId);

    @Aggregation(pipeline = {
            // 1) Group all documents (no $match)
            "{ '$group':   {"
                    + " '_id':       null,"
                    + " 'tasks':     { '$sum': 1 },"
                    + " 'completed': { '$sum': { '$cond': [ { '$eq': [ '$statut', 'DONE'     ] }, 1, 0 ] } },"
                    + " 'todo':      { '$sum': { '$cond': [ { '$eq': [ '$statut', 'TODO'     ] }, 1, 0 ] } },"
                    + " 'progress':  { '$sum': { '$cond': [ { '$eq': [ '$statut', 'PROGRESS' ] }, 1, 0 ] } },"
                    + " 'review':    { '$sum': { '$cond': [ { '$eq': [ '$statut', 'REVIEW'   ] }, 1, 0 ] } }"
                    + " } }",
            // 2) Drop the _id and keep only your counts
            "{ '$project': {"
                    + " '_id':      0,"
                    + " 'tasks':    1,"
                    + " 'completed':1,"
                    + " 'todo':     1,"
                    + " 'progress': 1,"
                    + " 'review':   1"
                    + " } }"
    })
    TasksStatsDTO getStatsAllTasks();

    public List<Tache> findAllByStatut(Tache.Statut statut);

    @Aggregation(pipeline = {
            "{ '$match': { " +
                    "'dateDebut': { '$ne': null }, " +
                    "'dateFin': { '$ne': null }, " +
                    "'statut': 'DONE' " +
                    "} }",
            "{ '$project': { " +
                    "'duration': { '$divide': [ { '$subtract': [ '$dateFin', '$dateDebut' ] }, 86400000 ] }, " +
                    "'month': { '$month': '$dateFin' }, " +
                    "'year': { '$year': '$dateFin' } " +
                    "} }",
            "{ '$match': { 'duration': { '$gte': 0 } } }",
            "{ '$group': { " +
                    "'_id': { 'month': '$month', 'year': '$year' }, " +
                    "'averageDurationInDays': { '$avg': '$duration' }, " +
                    "'count': { '$sum': 1 } " +
                    "} }",
            "{ '$project': { " +
                    "'_id': 0, " +
                    "'month': '$_id.month', " +
                    "'year': '$_id.year', " +
                    "'averageDurationInDays': 1, " +
                    "'count': 1 " +
                    "} }"
    })
    List<MonthlyTaskDurationDTO> getMonthlyAverageDurations();





}
