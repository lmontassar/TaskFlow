package com.taskflow.server.Controllers;

import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.*;
import com.taskflow.server.Services.NotificationService;
import com.taskflow.server.Services.ProjectService;
import com.taskflow.server.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@RestController
@RequestMapping("/project")
public class ProjectController {
    @Autowired
    private ProjectService projectService;
    @Autowired
    private UserService userService;
    @Autowired
    private JWT myJWT;
    @Autowired
    public NotificationService notificationService;
    @Autowired
    public SimpMessagingTemplate messagingTemplate;
    @PostMapping("/create")
    public ResponseEntity<?> addProject(
            @RequestHeader("Authorization") String token,
            @RequestBody ProjectRequest projectRequest
    ) {
        try {
            if ( token == null || myJWT.isTokenExpired( token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403
            }
            if (projectRequest.getNom() == null || projectRequest.getNom().isEmpty() || projectRequest.getDescription() == null || projectRequest.getDescription() .isEmpty()) {
                return ResponseEntity.status(413).build();
            }

            // Fetch user and validate
            User user = userService.findById(projectRequest.getCreateur());
            if (user == null) {
                return ResponseEntity.status(404).build();
            }

            // Create the project
            Project p = new Project();
            p.setNom(projectRequest.getNom() );
            p.setDescription(projectRequest.getDescription() );
            p.setDateDebut(projectRequest.getDateDebut() );
            p.setDateFinEstime(projectRequest.getDateFinEstime() );
            p.setDateCreation(new Date());
            p.setStatus(Project.Status.NOT_STARTED);
            p.setBudgetEstime(projectRequest.getBudgetEstime());
            p.setTags(projectRequest.getTags());
            // Create the project with the user as the owner
            Project project = projectService.createProject(p, user);
            return ResponseEntity.ok(project);
        } catch (RuntimeException e) {
            // Catch any unexpected errors and return a bad request response
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/addCollaborator")
    public ResponseEntity<?> joinProject(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> requestBody
    ) {
        String email = requestBody.get("email");
        String projectId =requestBody.get("projectId");

        String role = requestBody.get("role");
        try {
            User user = userService.findById(myJWT.extractUserId(token));
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found.");
            }
            Project pr = projectService.getMyProject(user.getId(),projectId);
            User userC = userService.findByEmail(email).orElse(null);
            if (userC ==null)
                return ResponseEntity.badRequest().body("user not found");

            if(pr.getListeCollaborateur().contains(userC)){

                return ResponseEntity.badRequest().body("user already in the project");
            }

            Notification notification = notificationService.CreateNotification(user,userC,pr, Notification.Type.INVITATION,"");
            if(notification!=null){

                return ResponseEntity.ok(pr);
            }
            return ResponseEntity.badRequest().body("try again later");

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/getProject/{id}")
    public ResponseEntity<?> getProject(@RequestHeader("Authorization") String token, @PathVariable String id) {
        try {
            User user = userService.findById(myJWT.extractUserId(token));
            Project myProjects = projectService.getMyProject(user.getId(),id);
            return ResponseEntity.ok(myProjects);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/getProjects")
    public ResponseEntity<?> getProjects(@RequestHeader("Authorization") String token) {
        try {
            User user = userService.findById(myJWT.extractUserId(token));
            Project myProjects = projectService.getMyProjects(user.getId());
            return ResponseEntity.ok(myProjects);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/getAllMyProjects")
    public ResponseEntity<?> getAllProjects(@RequestHeader("Authorization") String token) {
        try {
            User user = userService.findById(myJWT.extractUserId(token));
            List<Project> myProjects = projectService.getAllMyProjects(user.getId());
            return ResponseEntity.ok(myProjects);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/remove/{projectId}/{userId}")
    public ResponseEntity<?> removeUser(@RequestHeader("Authorization") String token,
                                        @PathVariable String projectId,
                                        @PathVariable String userId) {
        try {

            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            Project project = projectService.getProjectById(projectId);
            if (project == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Project not found");
            }

            Project updatedProject = projectService.removeCollaborator(project, user);

            if (updatedProject == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to remove collaborator.");
            }

            return ResponseEntity.ok(updatedProject);
        } catch (Exception e) {
            e.printStackTrace(); // for console debugging
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProject(@RequestHeader("Authorization") String token, @RequestBody ProjectUpdateRequest projectUpdateRequest) {
        try {
            // Validate the token and extract the userId from it
            String userId = myJWT.extractUserId(token);
            System.out.println("Token validated, extracted userId: " + projectUpdateRequest);

            // Fetch project details from the request
            String projectID = projectUpdateRequest.getId();
            Project project = projectService.getProjectById(projectID);

            // Check if project exists and if the current user is authorized to modify it
            if (project == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Project not found");
            }
            if (!Objects.equals(project.getCreateur().getId(), userId)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You are not authorized to update this project");
            }

            System.out.println("Project found: " + project.getNom());

            // Prepare the updated project fields from the request body
            String nom = projectUpdateRequest.getNom();
            String description = projectUpdateRequest.getDescription();
            float budgetEstime = projectUpdateRequest.getBudgetEstime();

            String dateDebutStr = String.valueOf(projectUpdateRequest.getDateDebut());
            String dateFinEstimeStr = String.valueOf(projectUpdateRequest.getDateFinEstime());

            // Define the ISO 8601 DateTimeFormatter
            DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

            // Parse the date strings to LocalDateTime
            LocalDateTime startDate = LocalDateTime.parse(dateDebutStr, formatter);
            LocalDateTime endDate = LocalDateTime.parse(dateFinEstimeStr, formatter);

            // Convert LocalDateTime to Date
            Date startDateAsDate = Date.from(startDate.atZone(TimeZone.getDefault().toZoneId()).toInstant());
            Date endDateAsDate = Date.from(endDate.atZone(TimeZone.getDefault().toZoneId()).toInstant());

            // Set the parsed Date objects to the project
            project.setDateDebut(startDateAsDate);
            project.setDateFinEstime(endDateAsDate);




            // Update the project object with the new values
            project.setNom(nom);
            project.setDescription(description);
            project.setBudgetEstime(budgetEstime);

            // Save the updated project
            Project updatedProject = projectService.updateProject(project);
            if (updatedProject != null) {
                return ResponseEntity.ok(updatedProject);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error updating the project, check project data");
            }

        } catch (NumberFormatException e) {
            // Handle case where budgetEstime is invalid
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid number format for budgetEstime");

        } catch (Exception e) {
            // Log and handle unexpected errors
            System.err.println("Error updating project: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update project");
        }
    }


}
