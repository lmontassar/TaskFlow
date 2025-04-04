package com.taskflow.server.Services;

import com.taskflow.server.Entities.Collaborator;
import com.taskflow.server.Entities.Invitation;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Repositories.InvitationRepository;
import com.taskflow.server.Repositories.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class InvitationService {
    @Autowired
    public InvitationRepository invitationRepository;
    @Autowired
    public ProjectRepository projectRepository;
    @Autowired
    public ProjectService projectService;
    public void AcceptInvitation(Invitation invitation){
        if(invitation.getReceiver()!=null){
            Collaborator c = new Collaborator();
            c.setUser(invitation.getReceiver());
            if(projectService.addCollaborator(invitation.getProject(),c)!=null){
                invitationRepository.delete(invitation);

            }
        }
    }
    public void DeclineInvitation(Invitation invitation){
        if(invitation.getReceiver()!=null){
            invitationRepository.delete(invitation);
        }
    }

    public Invitation changeStatus(Invitation invitation){
        if(invitation!=null){
            invitation.setStatus(true);
            return invitationRepository.save(invitation);
        }
        return null;
    }
    public Invitation CreateInvite(User sender,User receiver,Project project){
        if(sender==null || receiver==null || project == null)
            return null;
        Invitation invitation = new Invitation();
        invitation.setProject(project);
        invitation.setSender(sender);
        invitation.setReceiver(receiver);
        invitation.setCreationDate(new Date());
        return invitationRepository.save(invitation);
    }
    public List<Invitation> getMyInvitations(User receiver){
        return invitationRepository.findAllByReceiver(receiver);
    }

}
