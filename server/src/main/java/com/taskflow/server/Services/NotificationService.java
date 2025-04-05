package com.taskflow.server.Services;

import com.taskflow.server.Entities.Collaborator;
import com.taskflow.server.Entities.Notification;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Repositories.NotificationRepository;
import com.taskflow.server.Repositories.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class NotificationService {
    @Autowired
    public NotificationRepository notificationRepository;
    @Autowired
    public ProjectRepository projectRepository;
    @Autowired
    public ProjectService projectService;
    @Autowired
    public SimpMessagingTemplate messagingTemplate;
    public Boolean AcceptInvitation(Notification invitation){
        if(invitation.getReceiver()!=null){
            if(invitation.getType()== Notification.Type.INVITATION){
                Collaborator c = new Collaborator();
                c.setUser(invitation.getReceiver());
                if(projectService.addCollaborator(invitation.getProject(),c)!=null){
                    notificationRepository.delete(invitation);
                    return true;
                }
                return false;
            }
            return false;
        }
        return false;

    }
    public Boolean DeclineInvitation(Notification invitation){
        if(invitation.getReceiver()!=null){
            if(invitation.getType()== Notification.Type.INVITATION){
                notificationRepository.delete(invitation);
                return true;
            }
            return false;
        }
        return false;
    }

    public Notification changeStatus(Notification invitation){
        if(invitation!=null){
            invitation.setRead(true);
            return notificationRepository.save(invitation);
        }
        return null;
    }
    public List<Notification> getInvitations(){
        return notificationRepository.findAllByType(Notification.Type.INVITATION);
    }
    public void sendSocket(User receiver, Notification notification) {
        System.out.println("Sending notification ID: " + notification.getId() + " to user: " + receiver.getId());
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + receiver.getId(),
                notification
        );
    }
    public Notification CreateNotification(User sender,User receiver,Project project,Notification.Type type,String description){
        if(sender==null || receiver==null || project == null)
            return null;

        switch (type) {
            case INVITATION -> {
                if(notificationRepository.findAllByReceiverAndProjectAndType(receiver, project, Notification.Type.INVITATION).isEmpty()){
                    Notification invitation = new Notification();
                    invitation.setSender(sender);
                    invitation.setType(Notification.Type.INVITATION);
                    invitation.setTitle("Project Invitation");
                    invitation.setDescription(description);
                    invitation.setProject(project);
                    invitation.setReceiver(receiver);
                    invitation.setCreationDate(new Date());
                    Notification notification = notificationRepository.save(invitation);
                    sendSocket(receiver,notification);
                    return notification;
                }
                return null;

            }
            case SYSTEM -> {
                Notification notification = new Notification();
                notification.setTitle("System Notification");
                notification.setReceiver(receiver);
                notification.setType(Notification.Type.SYSTEM);
                notification.setCreationDate(new Date());
                Notification send_notification = notificationRepository.save(notification);
                sendSocket(receiver,send_notification);
                return send_notification;
            }
            case JOINED -> {
                Notification invitation = new Notification();
                invitation.setSender(sender);
                invitation.setTitle("Project Join");
                invitation.setProject(project);
                invitation.setReceiver(receiver);
                invitation.setType(Notification.Type.JOINED);
                invitation.setCreationDate(new Date());
                Notification send_notification = notificationRepository.save(invitation);
                sendSocket(receiver,send_notification);
                return send_notification;
            }

            default -> throw new IllegalArgumentException("Unknown notification type: " + type);
        }

    }
    public List<Notification> getMyNotifications(User receiver){
        return notificationRepository.findAllByReceiver(receiver);
    }

    public Notification getNotificationById(String id){
        return notificationRepository.findById(id).orElse(null);
    }

}
