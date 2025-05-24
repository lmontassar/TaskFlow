package com.taskflow.server.Services;

import java.time.LocalDateTime;
import java.util.*;

import com.taskflow.server.Entities.AffectationRessource;
import com.taskflow.server.Entities.Collaborator;
import com.taskflow.server.Entities.MaterialResource;
import com.taskflow.server.Entities.NecessaryRessource;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.Resource;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.taskflow.server.Entities.Tache;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Repositories.TacheRepository;

@Service
public class TacheService {
    @Autowired
    private TacheRepository tacheRep;

    @CacheEvict(value = "projectTasks", key = "#t.project.id")
    public Tache addTache(Tache t) {
        return tacheRep.save(t);
    }

    public List<Tache> findTaches() {
        return tacheRep.findAll();
    }

    public Tache findTacheById(String id) {
        return tacheRep.findById(id).orElse(null);
    }

    @Cacheable(value = "projectTasks", key = "#project.id")
    public List<Tache> findTacheByProjectId(Project project) {
        return tacheRep.getAllByProject(project);
    }

    public List<Tache> findTachesByUser(User u) {
        return tacheRep.findByAssigneeContainingOrRapporteur(u, u);
    }

    @CacheEvict(value = "projectTasks", key = "#t.project.id")
    public Tache update(Tache t) {
        return tacheRep.save(t);
    }

    @CacheEvict(value = "projectTasks", key = "#t.project.id")
    public Tache updateStatus(Tache t, Tache.Statut statut) {
        if (t.getStatut() == statut)
            return null;
        if (statut == Tache.Statut.DONE)
            t.setDateFin(LocalDateTime.now());
        if (t.getStatut() == Tache.Statut.DONE)
            t.setDateFin(null);
        t.setStatut(statut);
        return tacheRep.save(t);
    }

    @CacheEvict(value = "projectTasks", key = "#t.project.id")
    public void delete(Tache t) {
        List<Tache> taches = tacheRep.getAllByParent(t);
        for (Tache ta : taches) {
            ta.setParent(null);
            tacheRep.save(ta);
        }
        List<Tache> paralleles = tacheRep.findAllByParallelesContains(t);
        for (Tache ta : paralleles) {
            ta.deleteParallele(t);
            tacheRep.save(ta);
        }
        List<Tache> precendes = tacheRep.findAllByPrecedentesContains(t);
        for (Tache ta : precendes) {
            ta.deletePrecedente(t);
            tacheRep.save(ta);
        }
        tacheRep.delete(t);
    }

    public boolean IsRapporteur(User u, Tache task) {
        return task.getRapporteur().equals(u);
    }

    public boolean IsUserExistInAsignee(User u, Tache task) {
        if (u == null || task == null)
            return false;
        for (User Asignee : task.getAssignee()) {
            if (Asignee.getId().equals(u.getId()))
                return true;
        }
        return false;
    }

    public boolean isCreateur(User u, Tache task) {
        if (u == null || task == null)
            return false;
        return u.getId().equals(task.getProject().getCreateur().getId());
    }

    public boolean isMember(User AssigneeUser, Tache task) {
        for (Collaborator members : task.getProject().getListeCollaborateur()) {
            if (AssigneeUser.equals(members.getUser())) {
                return true;
            }
        }
        return false;
    }

    @CacheEvict(value = "projectTasks", key = "#task.project.id")
    public Tache addAssignee(User AssigneeUser, Tache task) {
        List<User> assignees = task.getAssignee();
        assignees.add(AssigneeUser);
        task.setAssignee(assignees);
        return tacheRep.save(task);
    }

    @CacheEvict(value = "projectTasks", key = "#task.project.id")
    public Tache removeAssignee(User AssigneeUser, Tache task) {
        List<User> assignees = task.getAssignee();
        assignees.remove(AssigneeUser);
        task.setAssignee(assignees);
        return tacheRep.save(task);
    }

    public Tache addPrecedente(Tache task, Tache PrecedenteTask) {
        task.addPrecedente(PrecedenteTask);
        return tacheRep.save(task);
    }

    public Tache removePrecedente(Tache task, Tache precedenteTask) {
        if (task.deletePrecedente(precedenteTask) == false)
            return null;

        return tacheRep.save(task);
    }

    public Tache addParallel(Tache task, Tache parallelTask) {
        task.addParallele(parallelTask);
        parallelTask.addParallele(task);
        tacheRep.save(parallelTask);
        return tacheRep.save(task);
    }

    public Tache removeParallel(Tache task, Tache parallelTask) {
        task.deleteParallele(parallelTask);
        parallelTask.deleteParallele(task);
        tacheRep.save(parallelTask);
        return tacheRep.save(task);
    }

    public Tache addSousTache(Tache task, Tache subTask) {
        subTask.setParent(task);
        return tacheRep.save(subTask);
    }

    public Tache removeSubTask(Tache task, Tache subTask) {
        if (subTask.getParent().equals(task) == false)
            return null;
        subTask.setParent(null);
        return tacheRep.save(subTask);
    }

    public List<Tache> getSubTasks(Tache task) {
        return tacheRep.getAllByParent(task);
    }

    public List<Tache> getTasksCanBePrecedente(Tache task) {
        List<Tache> allTasks = tacheRep.getAllByProject(task.getProject());
        List<Tache> result = new ArrayList<>();

        for (Tache t : allTasks) {
            if (t.equals(task))
                continue;
            if (task.equals(t.getParent()) || t.equals(task.getParent()))
                continue;
            if (task.getPrecedentes() != null && task.getPrecedentes().contains(t))
                continue;
            if (task.getParalleles() != null && task.getParalleles().contains(t))
                continue;
            if (t.getDateFinEstime() == null && t.getDateDebut() != null && t.getDuree() >= 0) {
                t.setDateFinEstime(t.getDateDebut().plusSeconds(t.getDuree()));
            }
            if ((t.getDateFinEstime() != null && task.getDateDebut() != null &&
                    t.getDateFinEstime().isBefore(task.getDateDebut())) || (t.getDateDebut() == null)) {
                result.add(t);
            }
        }
        return result;
    }

    public LocalDateTime getLastDate(Project project) {
        if (project == null) {
            return null;
        }
        List<Tache> taches = findTacheByProjectId(project);
        if (taches == null || taches.isEmpty()) {
            return null;
        }
        // Using non-static context and safe compareTo
        return taches.stream()
                .map(Tache::getDateFinEstime)
                .filter(Objects::nonNull)
                .max((date1, date2) -> date1.compareTo(date2)) // Using compareTo in a custom comparator
                .orElse(null);
    }

    public LocalDateTime getFirstDate(Project project) {
        if (project == null) {
            return null;
        }
        List<Tache> taches = findTacheByProjectId(project);
        if (taches == null || taches.isEmpty()) {
            return null;
        }
        // Using non-static context and safe compareTo
        return taches.stream()
                .map(Tache::getDateDebut)
                .filter(Objects::nonNull)
                .min((date1, date2) -> date1.compareTo(date2)) // Using compareTo in a custom comparator
                .orElse(null);
    }

    public Tache addNecessaryRessource(NecessaryRessource NewRess, Tache tache) {
        tache.addNecessaryRessource(NewRess);
        return tacheRep.save(tache);
    }

    public void removeNecessaryRessource(Tache task, NecessaryRessource ress) {
        task.deleteNecessaryRessource(ress);
        tacheRep.save(task);
    }

    public int qteAvailableMaterialRess(Tache t, MaterialResource ress, LocalDateTime dateDebut,
            LocalDateTime dateFin) {
        List<Tache> tasks = tacheRep.getAllByProject(t.getProject());
        int qteDisponible = ress.getQte();
        for (Tache task : tasks) {
            for (AffectationRessource r : task.getRessources()) {
                if (!r.getRess().equals(ress))
                    continue;
                if (!(r.getDateFin().isBefore(dateDebut) || r.getDateDebut().isAfter(dateFin))) {
                    qteDisponible -= (int) r.getQte();
                    if (qteDisponible == 0)
                        return 0;
                }
            }
        }
        return qteDisponible;
    }

    private LocalDateTime CalcDateFinEstime(Tache t) {
        if (t.getDateFinEstime() != null)
            return t.getDateFinEstime();
        if (t.getDateDebut() != null && t.getDuree() > 0)
            return t.getDateDebut().plusSeconds(t.getDuree());
        return null;
    }

    public boolean IsValidParent(Tache t, Tache parent) {
        if (parent == null)
            return true;

        LocalDateTime childStart = t.getDateDebut();
        LocalDateTime parentStart = parent.getDateDebut();

        if (childStart != null && parentStart != null && childStart.isBefore(parentStart))
            return false;

        LocalDateTime childEnd = CalcDateFinEstime(t);
        LocalDateTime parentEnd = CalcDateFinEstime(parent);

        if (childEnd == null || parentEnd == null)
            return true;
        return !childEnd.isAfter(parentEnd);
    }

    public boolean IsValidSubTasks(Tache p) {
        for (Tache sub : tacheRep.getAllByParent(p)) {
            if (!IsValidParent(sub, p))
                return false;
        }
        return true;
    }

    public boolean IsValidParallel(Tache t) {
        if (t.getDateDebut() == null)
            return true;
        return t.getParalleles().stream().filter(p -> p.getDateDebut() != null)
                .allMatch(p -> p.getDateDebut().isEqual(t.getDateDebut()));
    }

    public boolean IsValidPrec(Tache t) {
        if (t.getDateDebut() == null)
            return true;

        return t.getPrecedentes().stream().filter(
                prec -> !(prec.getDateFinEstime() == null && (prec.getDateDebut() == null || prec.getDuree() == 0))

        ).allMatch(
                prec -> CalcDateFinEstime(prec) == null || !t.getDateDebut().isBefore(CalcDateFinEstime(prec)));
    }

    public boolean IsValidNextTo(Tache pTask) {
        if (pTask.getDateDebut() == null && pTask.getDuree() == 0)
            return true;

        LocalDateTime end = CalcDateFinEstime(pTask);
        if (end == null)
            return true;

        List<Tache> successors = tacheRep.findAllByPrecedentesContains(pTask);

        return successors.stream().filter(t -> t.getDateDebut() != null)
                .allMatch(t -> !t.getDateDebut().isBefore(end));
    }

    public boolean isTaskValid(Tache t) {
        return IsValidParallel(t)
                && IsValidParent(t, t.getParent())
                && IsValidPrec(t)
                && IsValidNextTo(t)
                && IsValidSubTasks(t);
    }

    public Map<String, Integer> getStats(String projectId) {
        Map<String, Object> rawStats = tacheRep.getStatsByProject(projectId);

        if (rawStats == null || rawStats.isEmpty()) {
            return Map.of("tasks", 0, "completed", 0);
        }

        return Map.of(
                "tasks", ((Number) rawStats.get("tasks")).intValue(),
                "completed", ((Number) rawStats.get("completed")).intValue());
    }


    public int getCompletedTasks(Project project){
        List<Tache> taches = findTacheByProjectId(project);
        int completed = 0;
        for (Tache t :
                taches) {
            if (t.getStatut() == Tache.Statut.DONE) {
                completed++;
            }
        }
        return completed;
    }

}