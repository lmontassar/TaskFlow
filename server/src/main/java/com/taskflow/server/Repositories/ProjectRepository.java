package com.taskflow.server.Repositories;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Entities.DTO.ProjectsStatsDTO;

import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {
    public Project getProjectById(String id);
    public Project getProjectByCreateur(User id);
    public List<Project> findAllByStatus(Project.Status status);

        @Aggregation(pipeline = {
        // 1) group over _all_ projects
        "{ '$group': {"
          + "  '_id': null,"
          + "  'projects':           { '$sum': 1 },"
          + "  'notStartedProjects':{ '$sum': { '$cond': [ { '$eq': [ '$status', 'NOT_STARTED' ] }, 1, 0 ] } },"
          + "  'activeProjects':    { '$sum': { '$cond': [ { '$eq': [ '$status', 'IN_PROGRESS' ] }, 1, 0 ] } },"
          + "  'completedProjects': { '$sum': { '$cond': [ { '$eq': [ '$status', 'COMPLETED'   ] }, 1, 0 ] } },"
          + "  'createdThisMonth':  { '$sum': {"
          + "      '$cond': ["
          + "        { '$and': ["
          + "            { '$eq': [ { '$year': '$dateCreation' }, { '$year':  '$$NOW' } ] },"
          + "            { '$eq': [ { '$month':'$dateCreation' }, { '$month':'$$NOW' } ] }"
          + "        ] },"
          + "        1, 0"
          + "      ]"
          + "    }"
          + "  }"
          + "} }",
        // 2) drop the _id field so it maps cleanly
        "{ '$project': {"
          + "  '_id': 0,"
          + "  'projects': 1,"
          + "  'notStartedProjects': 1,"
          + "  'activeProjects': 1,"
          + "  'completedProjects': 1,"
          + "  'createdThisMonth': 1"
          + "} }"
    })
    ProjectsStatsDTO getStatsAllProjects();

}
