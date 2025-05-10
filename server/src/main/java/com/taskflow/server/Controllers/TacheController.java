package com.taskflow.server.Controllers;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import com.taskflow.server.Entities.Attachment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.AffectationRessource;
import com.taskflow.server.Entities.EnergeticResource;
import com.taskflow.server.Entities.MaterialResource;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.Resource;
import com.taskflow.server.Entities.Tache;
import com.taskflow.server.Entities.TemporaryResource;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Services.ProjectService;
import com.taskflow.server.Services.ResourceService;
import com.taskflow.server.Services.TacheService;
import com.taskflow.server.Services.UserService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/tache")
public class TacheController {

    private static final Pattern XSS_PATTERN = Pattern.compile("[<>\"%;&+]");

    @Autowired
    private ProjectService projectSer;

    @Autowired
    private TacheService tacheSer;

    @Autowired
    private UserService userService;

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private JWT myJWT;

    private static boolean canGet = false;
    private static boolean canEditTasks = false;
    private static boolean canAddTasks = false;
    private static boolean canDeleteTasks = false;
    private static boolean canChangeStatus = false;
    private static boolean canAddPrecedente = false;
    private static boolean canAddAssignee = false;
    private static boolean canDeleteAssignee = false;
    private static boolean canAddSubTask = false;
    private static boolean canAddParallel = false;
    private static boolean canDeleteSubTask = false;
    private static boolean canDeletePrecedenteTask = false;
    private static boolean canDeleteParallelTask = false;

    public void ResetPrivilege() {
        canGet = false;
        canEditTasks = false;
        canAddTasks = false;
        canDeleteTasks = false;
        canChangeStatus = false;
        canAddPrecedente = false;
        canAddAssignee = false;
        canDeleteAssignee = false;
        canAddSubTask = false;
        canAddParallel = false;
        canDeleteSubTask = false;
        canDeletePrecedenteTask = false;
        canDeleteParallelTask = false;
    }

    public void setAllPrivilegeTrue() {
        canGet = true;
        canEditTasks = true;
        canAddTasks = true;
        canDeleteTasks = true;
        canChangeStatus = true;
        canAddPrecedente = true;
        canAddAssignee = true;
        canDeleteAssignee = true;
        canAddSubTask = true;
        canAddParallel = true;
        canDeleteSubTask = true;
        canDeletePrecedenteTask = true;
        canDeleteParallelTask = true;
    }

    public void setPrivilege(User u, Project p, Tache t) {
        this.ResetPrivilege();
        if (u != null) {
            if (p != null) {
                if ((projectSer.isCreator(u.getId(), p)) == true) {
                    setAllPrivilegeTrue();
                } else if (projectSer.isCollaborator(u, p) == true) {
                    canGet = true;
                }
            }
            if (t != null) {
                if ((projectSer.isCreator(u.getId(), t.getProject())) == true) {
                    setAllPrivilegeTrue();
                } else {
                    if (projectSer.isCollaborator(u, t.getProject()) == true) {
                        canGet = true;
                    }
                    if (tacheSer.IsRapporteur(u, t) == true) {
                        canEditTasks = true;
                        canDeleteTasks = true;
                        canAddAssignee = true;
                        canDeleteAssignee = true;
                        canChangeStatus = true;
                        canAddSubTask = true;
                        canAddParallel = true;
                        canDeleteSubTask = true;
                        canDeletePrecedenteTask = true;
                        canDeleteParallelTask = true;

                    }
                    if ((tacheSer.IsUserExistInAsignee(u, t)) == true) {
                        canChangeStatus = true;
                    }
                }
            }
        }
    }

    public User getUserFromToken(String token) {
        String id = myJWT.extractUserId(token);
        return userService.findById(id);
    }

    @PostMapping("/add/assignee")
    public ResponseEntity<?> addAssignee(
            @RequestParam("taskID") String taskID,
            @RequestParam("userID") String userID,
            @RequestHeader("Authorization") String token

    ) {
        try {
            User u = getUserFromToken(token);
            User AssigneeUser = userService.findById(userID);
            if (u == null || AssigneeUser == null) {
                return ResponseEntity.status(404).body("utilisateur : not found"); // 404 Not Found
            }
            Tache task = tacheSer.findTacheById(taskID);
            if (task == null)
                return ResponseEntity.status(404).body("tache: not found");

            this.setPrivilege(u, task.getProject(), task);

            if (canAddAssignee == false)
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You're not able to add an asignee to this task");
            Boolean ok = tacheSer.isMember(AssigneeUser, task);
            if (ok == null || !ok) {
                return ResponseEntity.status(404).body("This user isn't a member of this project");
            }
            if (tacheSer.IsUserExistInAsignee(AssigneeUser, task))
                return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("this user is already added!!!");
            tacheSer.addAssignee(AssigneeUser, task);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete/assignee")
    public ResponseEntity<?> deleteAssignee(
            @RequestParam String taskID,
            @RequestParam String userID,
            @RequestHeader("Authorization") String token

    ) {
        try {

            User u = getUserFromToken(token);
            User AssigneeUser = userService.findById(userID);
            if (u == null || AssigneeUser == null) {
                return ResponseEntity.status(404).body("utilisateur : not found"); // 404 Not Found
            }
            Tache task = tacheSer.findTacheById(taskID);
            if (task == null) {
                return ResponseEntity.status(404).body("tache: not found");
            }
            Project p = projectSer.getProjectById(task.getProject().getId());
            if (p == null) {
                return ResponseEntity.status(404).body("projet: not found");
            }

            if (canDeleteAssignee == false)
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You're not able to delete an asignee to this task");

            if (tacheSer.IsUserExistInAsignee(AssigneeUser, task) == false)
                return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("this user isn't exist!!!");
            tacheSer.removeAssignee(AssigneeUser, task);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addTache(
            @RequestBody Tache task,
            @RequestHeader("Authorization") String token) {
        try {
            User u = getUserFromToken(token);
            if (u == null) {
                return ResponseEntity.notFound().build(); // 404 Not Found
            }
            Project p = projectSer.getProjectById(task.getProject().getId());
            if (p == null)
                return ResponseEntity.notFound().build();

            setPrivilege(u, p, null);
            if (canAddTasks == false)
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            if ((task.getNomTache() == null ||
                    task.getNomTache().isEmpty() ||
                    task.getNomTache().length() > 255 ||
                    XSS_PATTERN.matcher((task.getNomTache())).find())
                    ||
                    ((task.getDescription() != null && !task.getDescription().isEmpty()) &&
                            (task.getDescription().length() > 1000 ||
                                    XSS_PATTERN.matcher((task.getDescription())).find()))
                    ||
                    (task.getDateDebut() != null && task.getDateFinEstime() != null &&
                            task.getDateFinEstime().isBefore(task.getDateDebut()))
                    || task.getDuree() < 0 || task.getMarge() < 0 || task.getBudgetEstime() < 0)
                return ResponseEntity.status(416).build();

            task.setAssignee(new ArrayList<>());
            task.setComments(new ArrayList<>());
            task.setAttachments(new ArrayList<>());
            task.setPrecedentes(new ArrayList<>());
            task.setPrecedentes(new ArrayList<>());

            task.setProject(p);
            task.setDateCreation(LocalDateTime.now());
            task.setRapporteur(u);
            task.setStatut(Tache.Statut.TODO);
            tacheSer.addTache(task);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/add/soustache")
    public ResponseEntity<?> addSubTask(
            @RequestParam String taskID,
            @RequestParam String subTaskID,
            @RequestHeader("Authorization") String token) {

        try {
            User u = getUserFromToken(token);
            if (u == null)
                return ResponseEntity.notFound().build(); // 404 Not Found

            Tache task = tacheSer.findTacheById(taskID);
            if (task == null)
                return ResponseEntity.notFound().build();
            Tache subTask = tacheSer.findTacheById(subTaskID);
            if (subTask == null)
                return ResponseEntity.notFound().build();

            setPrivilege(u, null, task);
            if (canAddSubTask == false)
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            if (task.getProject().getId().equals(subTask.getProject().getId()) == false)
                return ResponseEntity.status(402).build(); // TODO: add here the addPrecedente Conditions

            Tache newTask = tacheSer.addSousTache(task, subTask);
            if (newTask == null)
                return ResponseEntity.status(401).build();
            return ResponseEntity.ok(newTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }

    }

    @PostMapping("/add/precedente")
    public ResponseEntity<?> AddPrecedenteTask(
            @RequestParam("taskID") String taskID,
            @RequestParam("precedenteTaskID") String precedenteTaskID,
            @RequestHeader("Authorization") String token) {
        try {
            User u = getUserFromToken(token);
            if (u == null)
                return ResponseEntity.notFound().build(); // 404 Not Found

            Tache task = tacheSer.findTacheById(taskID);
            if (task == null)
                return ResponseEntity.notFound().build();
            Tache precedenteTask = tacheSer.findTacheById(precedenteTaskID);
            if (precedenteTask == null)
                return ResponseEntity.notFound().build();

            setPrivilege(u, null, task);
            if (canAddPrecedente == false)
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            if (task.getProject().getId().equals(precedenteTask.getProject().getId()) == false)
                return ResponseEntity.status(402).build(); // TODO: add here the addPrecedente Conditions

            Tache newTask = tacheSer.addPrecedente(task, precedenteTask);
            if (newTask == null)
                return ResponseEntity.status(401).build();
            return ResponseEntity.ok(newTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/add/parallel")
    public ResponseEntity<?> AddParallelTask(
            @RequestParam String taskID,
            @RequestParam String parallelTaskID,
            @RequestHeader("Authorization") String token) {
        try {
            User u = getUserFromToken(token);
            if (u == null)
                return ResponseEntity.notFound().build(); // 404 Not Found

            Tache task = tacheSer.findTacheById(taskID);
            if (task == null)
                return ResponseEntity.notFound().build();
            Tache parallelTask = tacheSer.findTacheById(parallelTaskID);
            if (parallelTask == null)
                return ResponseEntity.notFound().build();

            setPrivilege(u, null, task);
            if (canAddParallel == false)
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            if (task.getProject().getId().equals(parallelTask.getProject().getId()) == false)
                return ResponseEntity.status(402).build(); // TODO: add here the addParallel Conditions

            Tache newTask = tacheSer.addParallel(task, parallelTask);
            if (newTask == null)
                return ResponseEntity.status(401).build();
            return ResponseEntity.ok(newTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get")
    public ResponseEntity<?> getTasks(
    // @RequestHeader("Authorization") String token
    ) {
        try {
            List<Tache> listTaches = tacheSer.findTaches();
            return ResponseEntity.ok().body(listTaches);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getTasks(
            @RequestHeader("Authorization") String token,
            @PathVariable("id") String id) {
        try {
            User u = getUserFromToken(token);
            Tache task = tacheSer.findTacheById(id);
            if (task == null)
                return ResponseEntity.notFound().build();

            setPrivilege(u, null, task);
            if (canGet == false)
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            return ResponseEntity.ok().body(task);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get/project/{id}")
    public ResponseEntity<?> getByProject(
            @RequestHeader("Authorization") String token,
            @PathVariable("id") String id) {
        try {
            User u = getUserFromToken(token);
            Project p = projectSer.getProjectById(id);
            this.setPrivilege(u, p, null);
            if (canGet == false)
                return ResponseEntity.notFound().build();
            List<Tache> tasks = tacheSer.findTacheByProjectId(p);
            if (tasks == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok().body(tasks);
        } catch (Exception e) {
            System.out.println(e); 
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get/soustaches/{id}")
    public ResponseEntity<?> getSubTasks(
            @RequestHeader("Authorization") String token,
            @PathVariable("id") String taskID) {
        try {
            User u = getUserFromToken(token);
            Tache t = tacheSer.findTacheById(taskID);
            this.setPrivilege(u, null, t);
            if (canGet == false)
                return ResponseEntity.notFound().build();

            List<Tache> tasks = tacheSer.getSubTasks(t);

            return ResponseEntity.ok().body(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get/taskscanbeprecedente/{id}")
    public ResponseEntity<?> getTasksCanBePrecedente(
            @RequestHeader("Authorization") String token,
            @PathVariable("id") String taskID) {
        try {
            User u = getUserFromToken(token);
            Tache t = tacheSer.findTacheById(taskID);
            this.setPrivilege(u, t.getProject(), t);
            if (canGet == false)
                return ResponseEntity.notFound().build();
            List<Tache> tasks = tacheSer.getTasksCanBePrecedente(t);
            return ResponseEntity.ok().body(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get/user/{id}")
    public ResponseEntity<?> getByUser(
            @RequestHeader("Authorization") String token) {
        try {
            User u = getUserFromToken(token);
            if (u == null)
                return ResponseEntity.notFound().build();
            List<Tache> tasks = tacheSer.findTachesByUser(u);
            if (tasks == null)
                return ResponseEntity.notFound().build();

            return ResponseEntity.ok().body(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/update/statut")
    public ResponseEntity<?> updateStatut(
            @RequestParam("taskID") String taskID,
            @RequestParam("statut") Tache.Statut statut,
            @RequestHeader("Authorization") String token) {
        try {
            User u = getUserFromToken(token);
            if (u == null)
                return ResponseEntity.notFound().build(); // 404 Not Found

            Tache task = tacheSer.findTacheById(taskID);
            if (task == null)
                return ResponseEntity.notFound().build();
            setPrivilege(u, null, task);
            if (canChangeStatus == false) // IF return 403
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            Tache OldTask = tacheSer.findTacheById(taskID);
            if (OldTask == null)
                ResponseEntity.notFound().build();
            Tache updatedTask = tacheSer.updateStatus(OldTask, statut);
            if (updatedTask == null)
                return ResponseEntity.ok().build();
            return ResponseEntity.ok().body(updatedTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/resize")
    public ResponseEntity<?> updateResize(
            @RequestBody Tache task,
            @RequestHeader("Authorization") String token) {
        try {
            
            User u = getUserFromToken(token);
            if (u == null)
                return ResponseEntity.notFound().build(); // 404 Not Found

            Tache oldTask = tacheSer.findTacheById(task.getId());
            if (oldTask == null)
                return ResponseEntity.notFound().build();

            setPrivilege(u, null, oldTask);

            if (canEditTasks == false)
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            if (task.getDateDebut() != null
                    && task.getDateFinEstime() != null
                    && task.getDateFinEstime().isBefore(task.getDateDebut()))
                return ResponseEntity.status(416).body("date_invalid");

            if (task.getDateDebut() != null) {
                LocalDateTime earliest = oldTask.getFirstDateDebutForMatRessource();
                System.out.println("earliest: " + earliest);

                if (earliest != null && task.getDateDebut().isAfter(earliest))
                    return ResponseEntity.status(416).body("date_dabut_invalid");
            }

            if (task.getDateFinEstime() != null) {
                LocalDateTime latest = oldTask.getLastDateFinForMatRessource();
                System.out.println("latest: " + latest);
                if (latest != null && task.getDateFinEstime().isBefore(latest))
                    return ResponseEntity.status(416).body("date_fin_invalid");
            }
            System.out.println(task.getDateFinEstime());
            oldTask.setDateDebut(task.getDateDebut());
            oldTask.setDateFinEstime(task.getDateFinEstime());
            Tache newTask = tacheSer.update(oldTask);
            return ResponseEntity.ok().body(newTask);

        } catch (Exception err) {
            System.out.println(err.getMessage() + "ftghjghj");
            return ResponseEntity.badRequest().build();
        }
    }


    @PutMapping("/update")
    public ResponseEntity<?> update(
            @RequestBody Tache task,
            @RequestHeader("Authorization") String token) {
        try {
            User u = getUserFromToken(token);
            if (u == null)
                return ResponseEntity.notFound().build(); // 404 Not Found

            Tache oldTask = tacheSer.findTacheById(task.getId());
            if (oldTask == null)
                return ResponseEntity.notFound().build();

            setPrivilege(u, null, oldTask);

            if (canEditTasks == false)
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            

            if (task.getNomTache() == null ||
                    task.getNomTache().isEmpty() ||
                    task.getNomTache().length() > 255 ||
                    XSS_PATTERN.matcher((task.getNomTache())).find())
                return ResponseEntity.status(416).body("nom_tache_invalid");

            if (((task.getDescription() != null && !task.getDescription().isEmpty()) &&
                    (task.getDescription().length() > 1000 ||
                            XSS_PATTERN.matcher((task.getDescription())).find())))
                return ResponseEntity.status(416).body("description_invalid");

            if (task.getDateDebut() != null
                    && task.getDateFinEstime() != null
                    && task.getDateFinEstime().isBefore(task.getDateDebut()))
                return ResponseEntity.status(416).body("date_invalid");

            if (task.getDateDebut() != null) {
                LocalDateTime earliest = oldTask.getFirstDateDebutForMatRessource();
                System.out.println("earliest: " + earliest);

                if (earliest != null && task.getDateDebut().isAfter(earliest))
                    return ResponseEntity.status(416).body("date_dabut_invalid");
            }
            if (task.getDateFinEstime() != null) {
                LocalDateTime latest = oldTask.getLastDateFinForMatRessource();
                System.out.println("latest: " + latest);
                if (latest != null && task.getDateFinEstime().isBefore(latest))
                    return ResponseEntity.status(416).body("date_fin_invalid");
            }

            if (task.getDuree() < 0)
                return ResponseEntity.status(416).body("duree_invalid");
            if (task.getMarge() < 0)
                return ResponseEntity.status(416).body("marge_invalid");
            if (task.getBudgetEstime() < 0)
                return ResponseEntity.status(416).body("budget_invalid");
            if (task.getQualite() > 5 || task.getQualite() < 0)
                return ResponseEntity.status(416).body("qualite_invalid");
            if (task.getDifficulte() == null)
                return ResponseEntity.status(416).body("difficulte_invalid");

            // nomTache;
            oldTask.setNomTache(task.getNomTache());
            // description;
            oldTask.setDescription(task.getDescription());
            // budgetEstime;
            oldTask.setBudgetEstime(task.getBudgetEstime());
            // qualite;
            oldTask.setQualite(task.getQualite());
            // difficulte;
            oldTask.setDifficulte(task.getDifficulte());
            // dateDebut;
            oldTask.setDateDebut(task.getDateDebut());
            // dateFinEstime;
            oldTask.setDateFinEstime(task.getDateFinEstime());
            // duree;
            oldTask.setDuree(task.getDuree());
            // marge;
            oldTask.setMarge(task.getMarge());
            Tache newTask = tacheSer.update(oldTask);
            return ResponseEntity.ok().body(newTask);

        } catch (Exception err) {
            System.out.println(err.getMessage() + "ftghjghj");
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> delete(
            @RequestParam("taskID") String taskID,
            @RequestHeader("Authorization") String token) {
        try {
            User u = getUserFromToken(token);
            if (u == null)
                return ResponseEntity.notFound().build();

            Tache OldTask = tacheSer.findTacheById(taskID);
            if (OldTask == null)
                ResponseEntity.notFound().build();
            setPrivilege(u, null, OldTask);

            if (canDeleteTasks == false)
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            tacheSer.delete(OldTask);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete/soustache")
    public ResponseEntity<?> deleteSubTask(
            @RequestParam String taskID,
            @RequestParam String subTaskID,
            @RequestHeader("Authorization") String token) {
        try {
            User u = getUserFromToken(token);
            if (u == null)
                return ResponseEntity.notFound().build();

            Tache task = tacheSer.findTacheById(taskID);
            if (task == null)
                ResponseEntity.notFound().build();
            Tache subTask = tacheSer.findTacheById(subTaskID);
            if (task == null)
                ResponseEntity.notFound().build();
            setPrivilege(u, null, task);

            if (canDeleteSubTask == false)
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            Tache EditedTask = tacheSer.removeSubTask(task, subTask);
            return ResponseEntity.ok(EditedTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete/precedente")
    public ResponseEntity<?> deletePrecedente(
            @RequestParam String taskID,
            @RequestParam String precTaskID,
            @RequestHeader("Authorization") String token) {
        try {
            User u = getUserFromToken(token);
            if (u == null)
                return ResponseEntity.notFound().build();

            Tache task = tacheSer.findTacheById(taskID);
            if (task == null)
                ResponseEntity.notFound().build();
            Tache precTask = tacheSer.findTacheById(precTaskID);
            if (precTask == null)
                ResponseEntity.notFound().build();
            setPrivilege(u, null, task);

            if (canDeletePrecedenteTask == false)
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            Tache EditedTask = tacheSer.removePrecedente(task, precTask);
            return ResponseEntity.ok(EditedTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete/parallel")
    public ResponseEntity<?> deleteParallel(
            @RequestParam String taskID,
            @RequestParam String parallelTaskID,
            @RequestHeader("Authorization") String token) {

        try {
            User u = getUserFromToken(token);
            if (u == null)
                return ResponseEntity.notFound().build();

            Tache task = tacheSer.findTacheById(taskID);
            if (task == null)
                ResponseEntity.notFound().build();
            Tache parallelTask = tacheSer.findTacheById(parallelTaskID);
            if (parallelTask == null)
                ResponseEntity.notFound().build();
            setPrivilege(u, null, task);

            if (canDeleteParallelTask == false)
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            Tache EditedTask = tacheSer.removeParallel(task, parallelTask);
            return ResponseEntity.ok(EditedTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/add/ressource")
    public ResponseEntity<?> AddRecource(
            @RequestParam String taskID,
            @RequestParam String ressourceID,
            @RequestParam(required = false) Integer qte,
            @RequestParam(required = false) Float consommation,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFin,
            @RequestHeader("Authorization") String token) {
        try {
            Resource ressource = resourceService.getById(ressourceID);
            Tache t = tacheSer.findTacheById(taskID);
            switch (ressource.getType()) {
                case "Temporary": {
                    if (qte == null)
                        return ResponseEntity.badRequest().build();
                    TemporaryResource ress = (TemporaryResource) ressource;
                    if (ress.getQte() < qte)
                        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(ress.getQte());
                    ress.setQte(ress.getQte() - qte);
                    resourceService.update(ress);

                    AffectationRessource affRess = new AffectationRessource();
                    affRess.setRess(ressource);
                    affRess.setQte(qte);
                    t.addRessource(affRess);
                    break;
                }
                case "Energetic": {
                    if (consommation == null)
                        return ResponseEntity.badRequest().build();

                    EnergeticResource ress = (EnergeticResource) ressource;
                    if ((ress.getConsommationMax() - ress.getConsommationTotale()) < consommation)
                        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE)
                                .body(ress.getConsommationMax() - ress.getConsommationTotale());
                    ress.setConsommationTotale(ress.getConsommationTotale() + consommation);
                    resourceService.update(ress);
                    AffectationRessource affRess = new AffectationRessource();
                    affRess.setRess(ressource);
                    affRess.setConsommation(consommation);
                    t.addRessource(affRess);
                    break;
                }
                case "Material": {
                    if (qte == null || dateDebut == null || dateFin == null)
                        return ResponseEntity.badRequest().build();
                    System.out.println("c1: "+t.getDateDebut().isAfter(dateDebut));
                    System.out.println("c3: "+t.getDateFinEstime().isBefore(dateFin));
                    if ((t.getDateDebut() != null && t.getDateDebut().isAfter(dateDebut))
                            || (t.getDateFinEstime() != null && t.getDateFinEstime().isBefore(dateFin))) {
                        return ResponseEntity.status(416).build();
                    }

                    MaterialResource ress = (MaterialResource) ressource;
                    int qteAvailable = tacheSer.qteAvailableMaterialRess(t, ress, dateDebut, dateFin);
                    if (qteAvailable < qte)
                        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(qteAvailable);
                    AffectationRessource affRess = new AffectationRessource();
                    affRess.setRess(ressource);
                    affRess.setQte(qte);
                    affRess.setDateDebut(dateDebut);
                    affRess.setDateFin(dateFin);
                    t.addRessource(affRess);
                    break;
                }
            }
            Tache updatedTask = tacheSer.update(t);
            return ResponseEntity.status(HttpStatus.OK).body(updatedTask);

        } catch (Exception err) {
            return ResponseEntity.ok().build();
        }
    }

    @PutMapping("/edit/ressource")
    public ResponseEntity<?> EditRessource(
            @RequestParam String taskID,
            @RequestParam String ressourceID,
            @RequestParam(required = false) Integer qte,
            @RequestParam(required = false) Float consommation,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFin,
            @RequestHeader("Authorization") String token) {
        try {
            Tache t = tacheSer.findTacheById(taskID);
            Resource ressource = resourceService.getById(ressourceID);
            AffectationRessource affRess = t.getRessources().stream()
                    .filter(a -> a.getRess().getId().equals(ressourceID))
                    .findFirst()
                    .orElse(null);
            if (affRess == null)
                return ResponseEntity.notFound().build();

            switch (ressource.getType()) {
                case "Temporary": {
                    if (qte == null)
                        return ResponseEntity.badRequest().build();
                    TemporaryResource ress = (TemporaryResource) ressource;

                    int currentQte = (int) affRess.getQte();
                    int delta = qte - currentQte;
                    if ((ress.getQte() + affRess.getQte()) < delta)
                        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(ress.getQte());

                    ress.setQte(ress.getQte() - delta);
                    affRess.setQte(qte);
                    resourceService.update(ress);
                    break;
                }
                case "Energetic": {
                    if (consommation == null)
                        return ResponseEntity.badRequest().build();
                    EnergeticResource ress = (EnergeticResource) ressource;

                    float delta = consommation - affRess.getConsommation();

                    if (((ress.getConsommationMax() - ress.getConsommationTotale())
                            + affRess.getConsommation()) < delta)
                        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE)
                                .body(ress.getConsommationMax() - ress.getConsommationTotale());
                    ress.setConsommationTotale(ress.getConsommationTotale() + delta);

                    affRess.setConsommation(consommation);
                    resourceService.update(ress);
                    break;
                }
                case "Material": {
                    if (qte == null || dateDebut == null || dateFin == null)
                        return ResponseEntity.badRequest().build();
                    if ((t.getDateDebut() != null && t.getDateDebut().isAfter(dateDebut))
                            || (t.getDateFinEstime() != null && t.getDateFinEstime().isBefore(dateFin))) {
                        return ResponseEntity.status(416).build();
                    }
                    MaterialResource ress = (MaterialResource) ressource;
                    t.getRessources().remove(affRess);
                    int qteAvailable = tacheSer.qteAvailableMaterialRess(t, ress, dateDebut, dateFin);
                    if ((qteAvailable + affRess.getQte()) < qte)
                        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(qteAvailable);
                    affRess.setQte(qte);
                    affRess.setDateDebut(dateDebut);
                    affRess.setDateFin(dateFin);
                    t.addRessource(affRess);
                    break;
                }
            }

            Tache updated = tacheSer.update(t);
            return ResponseEntity.ok(updated);

        } catch (Exception e) {

            return ResponseEntity.internalServerError().body("Error updating resource: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/ressource")
    public ResponseEntity<?> deleteRessource(
            @RequestParam String taskID,
            @RequestParam String ressourceID,
            @RequestParam(required = false) LocalDateTime dateDebut,
            @RequestParam(required = false) LocalDateTime dateFin,
            @RequestHeader("Authorization") String token) {
        try {
            Tache t = tacheSer.findTacheById(taskID);
            Resource ressource = resourceService.getById(ressourceID);

            if (ressource == null)
                return ResponseEntity.notFound().build();
            AffectationRessource affRess = t.getRessources().stream()
                    .filter(a -> {
                        if (a.getRess().getType().equals("Material") && "Material".equals(ressource.getType())) {
                            return a.getRess().getId().equals(ressource.getId())
                                    && a.getDateDebut().isEqual(dateDebut)
                                    && a.getDateFin().isEqual(dateFin);
                        }
                        return a.getRess().getId().equals(ressourceID);
                    })
                    .findFirst()
                    .orElse(null);
            if (affRess == null)
                return ResponseEntity.notFound().build();
            switch (ressource.getType()) {
                case "Temporary": {
                    TemporaryResource ress = (TemporaryResource) ressource;
                    ress.setQte(ress.getQte() + affRess.getQte());
                    resourceService.update(ress);
                    break;
                }
                case "Energetic": {
                    EnergeticResource ress = (EnergeticResource) ressource;
                    ress.setConsommationTotale(ress.getConsommationTotale() - affRess.getConsommation());
                    resourceService.update(ress);
                    break;
                }
                case "Material": {
                    break;
                }
            }

            // Supprimer de la tâche
            t.getRessources().remove(affRess);
            Tache updatedTask = tacheSer.update(t);
            return ResponseEntity.ok(updatedTask);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting resource: " + e.getMessage());
        }
    }

}