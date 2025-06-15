package com.taskflow.server.Services;

import com.taskflow.server.Entities.*;
import com.taskflow.server.Repositories.NotificationRepository;
import com.taskflow.server.Repositories.ProjectRepository;
import jakarta.mail.MessagingException;
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
    @Autowired
    public EmailService emailService;
    public Boolean AcceptInvitation(Notification invitation){
        if(invitation.getReceiver()!=null){
            if(invitation.getType()== Notification.Type.INVITATION){
                Collaborator c = new Collaborator();
                c.setUser(invitation.getReceiver());
                if(projectService.addCollaborator(invitation.getProject(),c)!=null){
                    messagingTemplate.convertAndSend(
                            "/topic/projects/" + invitation.getProject().getId(),
                            invitation.getProject()
                    );
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
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + receiver.getId(),
                notification
        );
    }
    public Boolean isGITHUB(String email){
        return email.contains("@github.com");
    }
    public Notification CreateNotification(User sender, User receiver, Project project, Notification.Type type, String description, Tache task){
        Notification notification = new Notification();
        String subject="";
        String body="";

        switch (type) {
            case INVITATION -> {
                if(sender==null || receiver==null || project == null)
                    return null;
                if(notificationRepository.findAllByReceiverAndProjectAndType(receiver, project, Notification.Type.INVITATION).isEmpty()){
                    notification.setSender(sender);
                    notification.setType(Notification.Type.INVITATION);
                    notification.setTitle("Project Invitation");
                    subject = "TaskFlow - Project Invitation";
                    body = String.format("%s invited you to %s project", sender.getNom()+" "+sender.getPrenom(), project.getNom());
                    notification.setDescription(description);
                    notification.setProject(project);
                    notification.setReceiver(receiver);
                    notification.setCreationDate(new Date());
                    break;
                }else{
                    return null;
                }


            }
            case SYSTEM -> {
                if(description==null || description=="")
                    return null;
                notification.setTitle("System Notification");
                notification.setReceiver(receiver);
                notification.setType(Notification.Type.SYSTEM);
                notification.setCreationDate(new Date());
                subject = "TaskFlow - System Notification";
                body = description;
                break;
            }
            case JOINED -> {
                if(sender==null || receiver==null || project == null)
                    return null;
                notification.setSender(sender);
                notification.setTitle("Project Join");
                notification.setProject(project);
                notification.setReceiver(receiver);
                notification.setType(Notification.Type.JOINED);
                notification.setCreationDate(new Date());
                subject = "TaskFlow - Project Join";
                body = String.format("%s joined your project : %s ", sender.getNom()+" "+sender.getPrenom(), project.getNom());

                break;
            }
            case MENTION -> {
                if(task==null){
                    return null;
                }
                notification.setTitle("Project Mention");
                subject = "TaskFlow - Project Mention";
                body = String.format("%s mentioned you in %s project : task %s", sender.getNom()+" "+sender.getPrenom(), project.getNom(),task.getNomTache());
                notification.setProject(project);
                notification.setReceiver(receiver);
                notification.setSender(sender);
                notification.setTask(task);
                notification.setCreationDate(new Date());
                notification.setType(Notification.Type.MENTION);
                break;
            }

            default -> throw new IllegalArgumentException("Unknown notification type: " + type);
        }
        Notification notification_send = notificationRepository.save(notification);
        sendSocket(receiver,notification_send);
        try {

            if(!isGITHUB(receiver.getEmail())){

                emailService.sendEmail(receiver.getEmail(),subject,body);
            }
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
        return notification_send;
    }
    public List<Notification> getMyNotifications(User receiver){
        return notificationRepository.findAllByReceiver(receiver);
    }
    public Notification markRead(Notification notification)
    {
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
    public Notification getNotificationById(String id){
        return notificationRepository.findById(id).orElse(null);
    }

}
