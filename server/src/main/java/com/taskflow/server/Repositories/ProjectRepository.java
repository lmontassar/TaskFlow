package com.taskflow.server.Repositories;

import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Entities.DTO.ProjectsStatsDTO;
import com.taskflow.server.Entities.DTO.TaskStatusStatsDTO;
import com.taskflow.server.Entities.DTO.TeamPerformanceDTO;

import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {
        public Project getProjectById(String id);

        public Project getProjectByCreateur(User id);

        public List<Project> findAllByStatus(Project.Status status);

        long countByStatus(Project.Status status);

        public interface ProjectStatsAggregation {
                long getProjects();

                long getNotStartedProjects();

                long getActiveProjects();

                long getCompletedProjects();

                double getBudgets();
        }

        @Aggregation(pipeline = {
                        "{ '$match': { 'dateCreation': { $gte: ?0, $lte: ?1 } } }",
                        "{ '$group': { _id: null, totalBudget: { $sum: '$budgetEstime' } } }",
                        "{ '$project': { _id: 0, totalBudget: 1 } }"
        })
        Double getTotalBudget(Date startDate, Date endDate);

        @Aggregation(pipeline = {
                        // 1) group over all projects
                        "{ '$group': {"
                                        + "  '_id': null,"
                                        + "  'projects':           { '$sum': 1 },"
                                        + "  'notStartedProjects': { '$sum': { '$cond': [ { '$eq': [ '$status', 'NOT_STARTED' ] }, 1, 0 ] } },"
                                        + "  'activeProjects':     { '$sum': { '$cond': [ { '$eq': [ '$status', 'IN_PROGRESS' ] }, 1, 0 ] } },"
                                        + "  'completedProjects':  { '$sum': { '$cond': [ { '$eq': [ '$status', 'COMPLETED'   ] }, 1, 0 ] } },"
                                        + "  'createdThisMonth':   { '$sum': {"
                                        + "       '$cond': ["
                                        + "         { '$and': ["
                                        + "             { '$eq': [ { '$year': '$dateCreation' }, { '$year':  '$$NOW' } ] },"
                                        + "             { '$eq': [ { '$month':'$dateCreation' }, { '$month':'$$NOW' } ] }"
                                        + "         ] },"
                                        + "         1, 0"
                                        + "       ]"
                                        + "     }"
                                        + "  },"
                                        + "  'budgets':            { '$sum': '$budgetEstime' }"
                                        + "} }",
                        // 2) drop the _id field so it maps cleanly
                        "{ '$project': {"
                                        + "  '_id': 0,"
                                        + "  'projects':           1,"
                                        + "  'notStartedProjects': 1,"
                                        + "  'activeProjects':     1,"
                                        + "  'completedProjects':  1,"
                                        + "  'createdThisMonth':   1,"
                                        + "  'budgets':            1"
                                        + "} }"
        })
        ProjectsStatsDTO getStatsAllProjects();

        @Aggregation(pipeline = {
                        // project stage: include only the fields we want
                        "{ '$project': {"
                                        + "  '_id': 1,"
                                        + "  'nom': 1,"
                                        + "  'description': 1,"
                                        + "  'budgetEstime': 1,"
                                        + "  'dateDebut': 1,"
                                        + "  'dateFinEstime': 1,"
                                        + "  'status': 1,"
                                        + "  'createur': 1,"
                                        + "  'dateCreation': 1"
                                        + "} }"
        })
        List<Project> getAllProjectsV2();

        @Aggregation(pipeline = {
                        "{ '$match': { 'dateCreation': { $gte: ?0, $lte: ?1 } } }",
                        "{ '$group': { _id: '$status', count: { $sum: 1 }, totalBudget: { $sum: '$budgetEstime' } } }",
                        "{ '$project': { status: '$_id', count: 1, totalBudget: 1, _id: 0 } }"
        })
        List<TaskStatusStatsDTO> getProjectStatusAggregation(Date startDate, Date endDate);

        @Aggregation(pipeline = {
                        // Team Performance: join tasks with users
                        "{ '$match': { 'dateCreation': { $gte: ?0, $lte: ?1 } } }",
                        "{ '$group': { _id: '$assignedTo', tasksAssigned: { $sum: 1 }, tasksCompleted: { $sum: { $cond: [ { $eq: [ '$statut', 'COMPLETED' ] }, 1, 0 ] } }, avgTaskDurationMs: { $avg: '$durationMs' }, totalBudget: { $sum: '$budgetEstime' }, avgQuality: { $avg: '$qualityScore' } } }",
                        "{ '$lookup': { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } }",
                        "{ '$unwind': '$user' }",
                        "{ '$project': { userId: '$_id', userName: '$user.name', role: '$user.role', tasksAssigned: 1, tasksCompleted: 1, avgTaskDuration: { $divide: [ '$avgTaskDurationMs', 86400000 ] }, totalBudgetManaged: '$totalBudget', qualityScore: '$avgQuality', _id: 0 } }",
                        "{ '$sort': { tasksCompleted: -1 } }",
                        "{ '$skip': ?3 }",
                        "{ '$limit': ?2 }"
        })
        List<TeamPerformanceDTO> getTeamPerformance(Date startDate, Date endDate, int limit, int offset);
}
