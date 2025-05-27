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
import com.taskflow.server.Entities.DTO.TeamPerformanceDTO;

import lombok.Data;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Repository
public interface TacheRepository extends MongoRepository<Tache, String> {
        public List<Tache> getAllByProject(Project p);

        public List<Tache> findByAssigneeContainingOrRapporteur(User u, User u2);

        public List<Tache> getAllByParent(Tache t);

        List<Tache> findAllByPrecedentesContains(Tache tache);

        List<Tache> findAllByParallelesContains(Tache tache);

        // In TacheRepository.java
        @Data
        public class TaskStatsAggregation {
                private Long totalTasks;
                private Long completedTasks;
                private Double spentBudget;
                private Long overdueTasks;
                private Long highRiskTasks;
                private Double avgDuration;
        }

        // In ProjectRepository.java
        public interface TotalBudgetAggregation {
                Double getTotalBudget(); // Changed from double to Double
        }

        @Aggregation(pipeline = {
                        // Performance Trends: group by day or week based on external grouping
                        "{ '$match': { 'dateCreation': { $gte: ?0, $lte: ?1 } } }",
                        "{ '$addFields': { period: { $dateToString: { format: ?2, date: '$dateCreation' } } } }",
                        "{ '$group': {"
                                        + " _id: '$period',"
                                        + " velocity: { $sum: '$storyPointsCompleted' },"
                                        + " quality: { $avg: '$qualityScore' },"
                                        + " efficiency: { $avg: '$efficiencyMetric' },"
                                        + " burndown: { $sum: '$remainingWork' }"
                                        + " } }",
                        "{ '$project': { date: '$_id', velocity: 1, quality: 1, efficiency: 1, burndown: 1, _id: 0 } }",
                        "{ '$sort': { date: 1 } }"
        })
        List<com.taskflow.server.Entities.DTO.PerformanceTrendDTO> getPerformanceTrends(Date startDate, Date endDate,
                        String dateFormat);

        @Aggregation(pipeline = {
                        "{ '$match': { 'dateCreation': { $gte: ?0, $lte: ?1 } } }",
                        "{ '$facet': { " +
                                        "results: [ " +
                                        "{ '$group': { " +
                                        "_id: null, " +
                                        "totalTasks: { $sum: 1 }, " +
                                        "completedTasks: { $sum: { $cond: [ { $eq: [ '$statut', 'DONE' ] }, 1, 0 ] } }, "
                                        +
                                        "spentBudget: { $sum: { $cond: [ { $eq: [ '$statut', 'DONE' ] }, '$budgetEstime', 0 ] } }, "
                                        +
                                        "overdueTasks: { $sum: { $cond: [ { $and: [ { $ne: [ '$statut', 'DONE' ] }, { $lt: [ '$dateFinEstime', '$dateFin' ] } ] }, 1, 0 ] } }, "
                                        +
                                        "highRiskTasks: { $sum: { $cond: [ { $or: [ { $eq: [ '$difficulte', 'hard' ] }, { $lt: [ { $subtract: [ '$dateFinEstime', new Date() ] }, 604800000 ] } ] }, 1, 0 ] } }, "
                                        +
                                        "avgDuration: { $avg: { $cond: [ { $eq: [ '$statut', 'DONE' ] }, { $subtract: [ '$dateFinEstime', '$dateDebut' ] }, null ] } } "
                                        +
                                        "} }" +
                                        "], " +
                                        "default: [ { $project: { _id: 0 } } ] " +
                                        "} }",
                        "{ '$unwind': '$results' }",
                        "{ '$replaceRoot': { newRoot: '$results' } }",
                        "{ '$project': { " +
                                        "totalTasks: { $ifNull: [ '$totalTasks', 0 ] }, " +
                                        "completedTasks: { $ifNull: [ '$completedTasks', 0 ] }, " +
                                        "spentBudget: { $ifNull: [ '$spentBudget', 0 ] }, " +
                                        "overdueTasks: { $ifNull: [ '$overdueTasks', 0 ] }, " +
                                        "highRiskTasks: { $ifNull: [ '$highRiskTasks', 0 ] }, " +
                                        "avgDuration: { $ifNull: [ '$avgDuration', 0 ] } " +
                                        "} }"
        })
        TaskStatsAggregation getTaskStats(Date startDate, Date endDate);

        @Aggregation(pipeline = {
                        "{ '$match': { 'dateCreation': { $gte: ?0, $lte: ?1 } } }",
                        "{ '$group': { _id: null, totalBudget: { $sum: '$budgetEstime' } } }",
                        "{ '$project': { _id: 0, totalBudget: 1 } }"
        })
        TotalBudgetAggregation getTotalBudget(Date startDate, Date endDate);

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
                                        "'duration': { '$divide': [ { '$subtract': [ '$dateFin', '$dateDebut' ] }, 86400000 ] }, "
                                        +
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

        @Aggregation(pipeline = {
                        // Filter tasks by creation date range
                        "{ '$match': { 'dateCreation': { $gte: ?0, $lte: ?1 } } }",
                        // Group by 'statut' field in MongoDB
                        "{ '$group': { _id: '$statut', count: { $sum: 1 }, totalBudget: { $sum: '$budgetEstime' } } }",
                        // Project into DTO fields: status from _id, count, totalBudget
                        "{ '$project': { status: '$_id', count: 1, totalBudget: 1, _id: 0 } }"
        })
        List<com.taskflow.server.Entities.DTO.TaskStatusStatsDTO> getTaskStatusAggregation(Date startDate,
                        Date endDate);

        @Aggregation(pipeline = {
                        // 1. Filter by date AND ensure at least one assignee
                        "{ $match: { "
                                        + "dateCreation: { $gte: ?0, $lte: ?1 }, "
                                        + "\"assignee.0\": { $exists: true } "
                                        + "} }",

                        // 2. Unwind assignees
                        "{ $unwind: \"$assignee\" }",

                        // 3. Group per assignee
                        "{ $group: { "
                                        + "_id: \"$assignee.$id\", "
                                        + "tasksAssigned:   { $sum: 1 }, "
                                        + "tasksCompleted:  { $sum: { $cond: [ { $eq: [ \"$statut\", \"DONE\" ] }, 1, 0 ] } }, "
                                        + "avgTaskDurationMs: { $avg: \"$duree\" }, "
                                        + "totalBudget:     { $sum: \"$budgetEstime\" }, "
                                        + "avgQuality:      { $avg: \"$qualite\" } "
                                        + "} }",

                        // 4. Join back to users
                        "{ $lookup: { "
                                        + "from: \"users\", localField: \"_id\", foreignField: \"_id\", as: \"user\" "
                                        + "} }",
                        "{ $unwind: \"$user\" }",

                        // 5. Shape DTO
                        "{ $project: { "
                                        + "userId:       \"$_id\", "
                                        + "userName:     { $concat: [ \"$user.nom\", \" \", \"$user.prenom\" ] }, "
                                        + "role:         { $ifNull: [ \"$user.title\", \"No Specific\" ] }, "
                                        + "tasksAssigned:1, tasksCompleted:1, "
                                        + "completionRate: { $round: [ { $multiply: [ "
                                        + "{ $cond: [ { $gt:[\"$tasksAssigned\",0] }, { $divide:[\"$tasksCompleted\",\"$tasksAssigned\"] }, 0 ] }, "
                                        + "100 ] }, 1 ] }, "
                                        + "qualityScore:  { $round:[\"$avgQuality\", 2] }, "
                                        + "avgTaskDuration: { $round:[ { $divide:[ \"$avgTaskDurationMs\", 86400 ] }, 2 ] }, "
                                        + "totalBudgetManaged: \"$totalBudget\", "
                                        + "_id: 0 "
                                        + "} }",

                        // 6. Sort & paginate
                        "{ $sort: { tasksCompleted: -1 } }",
                        "{ $skip: ?3 }",
                        "{ $limit: ?2 }"
        })
        List<TeamPerformanceDTO> getTeamPerformance(Date startDate, Date endDate, int limit, int offset);

}
