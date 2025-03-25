package com.taskflow.server.Controllers;

import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.Collaborator;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.ProjectRequest;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Services.ProjectService;
import com.taskflow.server.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@RestController
@RequestMapping("/project")
public class ProjectController {
    @Autowired
    private ProjectService projectService;
    @Autowired
    private UserService userService;
    @Autowired
    private JWT myJWT;
    @PostMapping("/create")
    public ResponseEntity<?> addProject(
            @RequestHeader("Authorization") String token,
            @RequestBody ProjectRequest projectRequest
    ) {
        try {
            if ( token == null || myJWT.isTokenExpired( token)) {
                System.out.println("Yes the token : "+token+ "\t is expired");
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
            @RequestBody String email,
            @RequestBody String role
    ) {
        try {
            User user = userService.findById(myJWT.extractUserId(token));
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found.");
            }
            Project pr = projectService.getMyProject(user.getId());
            User userC = userService.findByEmail(email).orElse(null);
            Collaborator collaborator = new Collaborator();
            collaborator.setUser(userC);
            collaborator.setRole(role);
            Project updatedProject = projectService.addCollaborator(pr, collaborator);
            return ResponseEntity.ok(updatedProject);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
