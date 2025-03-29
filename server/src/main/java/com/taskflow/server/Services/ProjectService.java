package com.taskflow.server.Services;

import com.taskflow.server.Entities.Collaborator;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Repositories.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private UserService userService;
    public Project createProject(Project p, User u) {
        // Ensure user is valid
        if (u == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        if (p == null) {
            throw new IllegalArgumentException("Project cannot be null");
        }

        p.setCreateur(u);

        Set<Collaborator> set = new HashSet<>();

        // Set the collaborators for the project
        p.setListeCollaborateur(set);

        // Save the project to the database
        return projectRepository.save(p);  // Assuming projectRepository is already defined and injected
    }
    public Project addCollaborator(Project p,Collaborator c)
    {
        User user = c.getUser();
        if(user != null)
        {
            Set<Collaborator> collab = p.getListeCollaborateur();
            collab.add(c);
            p.setListeCollaborateur(collab);
            return projectRepository.save(p);
        }
        return null;
    }
    public Project getMyProject(String userId) {
        // Fetch all projects from the repository
        User user = userService.findById(userId);
        Project project = projectRepository.getProjectByCreateur(user);
        project.getCreateur().setPassword(null);
        project.getCreateur().setTwoFactorAuth(null);
        // Filter projects where the user is in the collaborators set
        return project;
    }

    public Project getProjectById(String id){
        Project project = projectRepository.getProjectById(id);
        if (project == null) {
            throw new RuntimeException("Project not found with ID: " + id);
        }
        return project;
    }


    
}
