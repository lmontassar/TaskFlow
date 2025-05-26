package com.taskflow.server.Repositories;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {
    public Project getProjectById(String id);
    public Project getProjectByCreateur(User id);
    public List<Project> findAllByStatus(Project.Status status);

}
