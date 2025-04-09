package com.taskflow.server.Services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.taskflow.server.Entities.Collaborator;
import com.taskflow.server.Entities.Project;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.taskflow.server.Entities.Tache;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Repositories.TacheRepository;

@Service
public class TacheService {
    @Autowired
    private TacheRepository tacheRep;
    
    public Tache addTache(Tache t) {
        return tacheRep.save(t);
    }

    public List<Tache> findTaches(){
        return tacheRep.findAll() ;
    }
    public Tache findTacheById(String id){
        return tacheRep.findById(id).orElse(null);
    }
    public List<Tache> findTacheByProjectId(Project project){
        return tacheRep.getAllByProject(project);
    }

    public List<Tache> findTachesByUser(User u) {
        return tacheRep.findByAssigneeContainingOrRapporteur(u,u);
    }

    public Tache update(Tache t ){
        return tacheRep.save(t);
    }

    public Tache updateStatus(Tache t, Tache.Statut statut) {
        if( t.getStatut() == statut ) return null ;
        if( statut == Tache.Statut.DONE ) t.setDateFin(LocalDateTime.now());
        if( t.getStatut() == Tache.Statut.DONE ) t.setDateFin(null);
        t.setStatut(statut);
        return tacheRep.save(t);
    }
    public void delete(Tache t) {
        tacheRep.delete(t);
    }

    public boolean IsUserExistInAsignee(User u,Tache task) {
        if(u == null || task == null) return false;
        for (User Asignee : task.getAssignee() ) {
            if(Asignee.getId().equals(u.getId())) return true;            
        }
        return false;
    }

    public boolean isCreateur(User u, Tache task) {
        if( u == null || task == null ) return false ;
        return u.getId().equals(task.getProject().getCreateur().getId());
    }
    public boolean isMember(User AssigneeUser,Tache  task){
        for (Collaborator members: task.getProject().getListeCollaborateur()) {
            if( AssigneeUser.equals( members.getUser() ) ) {
                return true;
            }
        } return false;
    }
    public Tache addAssignee(User AssigneeUser,Tache  task) {
        List<User> assignees = task.getAssignee() ;
        assignees.add(AssigneeUser);
        task.setAssignee(  assignees );
        return tacheRep.save(task);
    }
    public Tache removeAssignee(User AssigneeUser,Tache  task) {
        List<User> assignees = task.getAssignee() ;
        assignees.remove(AssigneeUser);
        task.setAssignee(  assignees );
        return tacheRep.save(task);
    }

}
