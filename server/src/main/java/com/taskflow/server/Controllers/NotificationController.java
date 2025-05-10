package com.taskflow.server.Controllers;

import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.Notification;
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
    public NotificationService notificationService;
    @Autowired
    public UserService userService;
    @Autowired
    public ProjectService projectService;
    @Autowired
    private JWT myJWT;

    @PutMapping("/accept-invitation")
    public ResponseEntity<?> AcceptInvitation(@RequestHeader("Authorization") String token,
                                              @RequestBody Map<String, String> requestBody){
        String invitationId = requestBody.get("invitationId");
        try {
            Notification invitation = notificationService.getNotificationById(invitationId);
            User user = userService.findById(myJWT.extractUserId(token));
            if(user==null){
                return ResponseEntity.status(403).build();
            }
            if(!Objects.equals(user.getId(), invitation.getReceiver().getId())){
                return ResponseEntity.status(403).build();
            }
            if(notificationService.AcceptInvitation(invitation)){
                notificationService.CreateNotification(invitation.getReceiver(),invitation.getSender(),invitation.getProject(), Notification.Type.JOINED,"",null);
                return ResponseEntity.status(200).build();
            }
            return ResponseEntity.status(404).build();
        }catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PutMapping("/decline-invitation")
    public ResponseEntity<?> DeclineInvitation(@RequestHeader("Authorization") String token,
                                              @RequestBody Map<String, String> requestBody){
        String invitationId = requestBody.get("invitationId");
        try {
            Notification invitation = notificationService.getNotificationById(invitationId);
            User user = userService.findById(myJWT.extractUserId(token));
            if(user==null){
                return ResponseEntity.status(403).build();
            }
            if(!Objects.equals(user.getId(), invitation.getReceiver().getId())){
                return ResponseEntity.status(403).build();
            }
            if(notificationService.DeclineInvitation(invitation)){
                return ResponseEntity.status(200).build();
            }
            return ResponseEntity.status(404).build();
        }catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/get-notifications")
    public ResponseEntity<?> GetMyInvitations(@RequestHeader("Authorization") String token){
        try {
            User user = userService.findById(myJWT.extractUserId(token));
            if(user==null){
                return ResponseEntity.status(403).build();
            }
            List<Notification> myInvitations = notificationService.getMyNotifications(user);
            return ResponseEntity.ok(myInvitations);
        }catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
