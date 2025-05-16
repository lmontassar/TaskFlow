package com.taskflow.server.Services;

import com.taskflow.server.Entities.Collaborator;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.Resource;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Repositories.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    public SimpMessagingTemplate messagingTemplate;

    @Autowired
    public TacheService tacheService;

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

        List<Resource> set2 = new ArrayList<>();

        p.setListeRessource(set2);

        // Save the project to the database
        return projectRepository.save(p); // Assuming projectRepository is already defined and injected
    }

    public Project updateProject(Project project) {
        // Convert project dates to LocalDateTime
        LocalDateTime projectStartDate = project.getDateDebut().toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
        LocalDateTime projectEndDate = project.getDateFinEstime().toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
        // Get first and last task dates as LocalDateTime
        LocalDateTime firstTask = tacheService.getFirstDate(project);
        LocalDateTime lastTask = tacheService.getLastDate(project);
        // Check if the project's date range includes the first and last task dates
        if (projectStartDate.isBefore(firstTask) && projectEndDate.isAfter(lastTask)) {

            return projectRepository.save(project);
        }
        return null;
    }

    public Project UpdateChat(Project project) {
        Project oldP = getProjectById(project.getId());
        oldP.setMessages(project.getMessages());
        return projectRepository.save(oldP);
    }

    public Project addCollaborator(Project p, Collaborator c) {
        User user = c.getUser();
        if (user != null) {
            Set<Collaborator> collab = p.getListeCollaborateur();
            c.setRole("Member");
            collab.add(c);
            p.setListeCollaborateur(collab);
            return projectRepository.save(p);
        }
        return null;
    }

    public Project addResource(Project p, Resource resource) {
        if (p != null) {
            List<Resource> resources = p.getListeRessource();
            resources.add(resource);
            p.setListeRessource(resources);
            return projectRepository.save(p);
        }
        return null;
    }

    public Project removeCollaborator(Project p, User user) {
        if (user != null) {
            Set<Collaborator> collab = p.getListeCollaborateur();

            Collaborator c = collab.stream()
                    .filter(collaborator -> collaborator.getUser().getId().equals(user.getId()))
                    .findFirst()
                    .orElse(null);

            if (c != null) {
                collab.remove(c);
                p.setListeCollaborateur(collab);
                messagingTemplate.convertAndSend(
                        "/topic/projects/" + p.getId(),
                        p);

                return projectRepository.save(p);
            }
        }
        return null;
    }

    public Project getMyProject(String userId, String projectId) {
        return projectRepository.findAll().stream()
                .filter(project -> {
                    boolean isProject = project.getId() != null && project.getId().equals(projectId);
                    boolean isCollaborator = project.getListeCollaborateur().stream()
                            .anyMatch(collaborator -> collaborator.getUser() != null &&
                                    userId.equals(collaborator.getUser().getId()));

                    boolean isCreator = project.getCreateur() != null &&
                            project.getCreateur().getId() != null &&
                            userId.equals(project.getCreateur().getId());

                    return isProject && (isCollaborator || isCreator);
                })
                .findFirst()
                .orElse(null);
    }

    public Project getMyProjects(String userId) {
        return projectRepository.findAll().stream()
                .filter(project -> {
                    boolean isCollaborator = project.getListeCollaborateur().stream()
                            .anyMatch(collaborator -> collaborator.getUser() != null &&
                                    userId.equals(collaborator.getUser().getId()));

                    boolean isCreator = project.getCreateur() != null &&
                            project.getCreateur().getId() != null &&
                            userId.equals(project.getCreateur().getId());

                    return (isCollaborator || isCreator);
                })
                .findFirst()
                .orElse(null);
    }

    public Boolean isCollaborator(User u, Project p) {
        for (Collaborator members : p.getListeCollaborateur()) {
            if (u.equals(members.getUser())) {
                return true;
            }
        }
        return false;
    }

    public Boolean isCreator(String user, Project project) {
        return project.getCreateur().getId().equals(user);
    }

    public List<Project> getAllMyProjects(String userId) {
        return projectRepository.findAll().stream()
                .filter(project -> {
                    boolean isCollaborator = project.getListeCollaborateur().stream()
                            .anyMatch(collaborator -> collaborator.getUser() != null &&
                                    userId.equals(collaborator.getUser().getId()));

                    boolean isCreator = project.getCreateur() != null &&
                            project.getCreateur().getId() != null &&
                            userId.equals(project.getCreateur().getId());

                    return (isCollaborator || isCreator);
                }).collect(Collectors.toList());
    }

    public Project getProjectById(String id) {
        Project project = projectRepository.getProjectById(id);
        if (project == null) {
            throw new RuntimeException("Project not found with ID: " + id);
        }
        return project;
    }

    public void removeResource(Project project, Resource resource) {
        project.getListeRessource().remove(resource);
        projectRepository.save(project);
    }

}
