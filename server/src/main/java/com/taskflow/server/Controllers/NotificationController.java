package com.taskflow.server.Controllers;

import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Services.NotificationService;
import com.taskflow.server.Services.ProjectService;
import com.taskflow.server.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    @Autowired
    public NotificationService invitationService;
    @Autowired
    public UserService userService;
    @Autowired
    public ProjectService projectService;
    @Autowired
    private JWT myJWT;
    @PostMapping("/create")
    public ResponseEntity<?> CreateInvitation(@RequestHeader("Authorization") String token,
                                              @RequestBody Map<String, String> requestBody){
        String senderEmail = requestBody.get("sender");
        String receiverEmail = requestBody.get("receiver");
        String projectId = requestBody.get("project");
        try{
            Project project = projectService.getProjectById(projectId);
            if(project==null){
                return ResponseEntity.status(400).build();
            }
            User sender = userService.findByEmail(senderEmail).orElse(null);
            if(sender ==null){
                return ResponseEntity.status(400).build();
            }
            if(!Objects.equals(project.getCreateur().getId(), sender.getId())){
                return ResponseEntity.status(403).build();
            }
            User receiver = userService.findByEmail(receiverEmail).orElse(null);
            if(receiver==null){
                return ResponseEntity.status(403).build();
            }
            if(invitationService.CreateInvite(sender,receiver,project)!=null){
                return ResponseEntity.status(200).build();
            }
            return ResponseEntity.status(404).build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PutMapping("/accept")
    public ResponseEntity<?> AcceptInvitation(@RequestHeader("Authorization") String token,
                                              @RequestBody Map<String, String> requestBody){
        String invitationId = requestBody.get("invitationId");
        try {
            Invitation invitation = invitationService.getInvitationById(invitationId);
            User user = userService.findById(myJWT.extractUserId(token));
            if(user==null){
                return ResponseEntity.status(403).build();
            }
            if(!Objects.equals(user.getId(), invitation.getReceiver().getId())){
                return ResponseEntity.status(403).build();
            }
            if(invitationService.AcceptInvitation(invitation)){
                return ResponseEntity.status(200).build();
            }
            return ResponseEntity.status(404).build();
        }catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PutMapping("/decline")
    public ResponseEntity<?> DeclineInvitation(@RequestHeader("Authorization") String token,
                                              @RequestBody Map<String, String> requestBody){
        String invitationId = requestBody.get("invitationId");
        try {
            Invitation invitation = invitationService.getInvitationById(invitationId);
            User user = userService.findById(myJWT.extractUserId(token));
            if(user==null){
                return ResponseEntity.status(403).build();
            }
            if(!Objects.equals(user.getId(), invitation.getReceiver().getId())){
                return ResponseEntity.status(403).build();
            }
            if(invitationService.DeclineInvitation(invitation)){
                return ResponseEntity.status(200).build();
            }
            return ResponseEntity.status(404).build();
        }catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/getInvitations")
    public ResponseEntity<?> GetMyInvitations(@RequestHeader("Authorization") String token){
        try {
            User user = userService.findById(myJWT.extractUserId(token));
            if(user==null){
                return ResponseEntity.status(403).build();
            }
            List<Invitation> myInvitations = invitationService.getMyInvitations(user);
            return ResponseEntity.ok(myInvitations);
        }catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
