package com.taskflow.server.Controllers;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.Tache;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Services.ProjectService;
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
    private static boolean  canDeletePrecedenteTask = false;
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
            Project p = projectSer.getProjectById(task.getProject().getId());
            if (p == null)
                return ResponseEntity.status(404).body("projet: not found");

            // CHECK PRIVELEGE
            this.setPrivilege(u, p, task);

            if (canAddAssignee == false)
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You're not able to add an asignee to this task");
            if (tacheSer.isMember(AssigneeUser, task) == false)
                return ResponseEntity.status(404).body("This user isn't a member of this project");
            if (tacheSer.IsUserExistInAsignee(AssigneeUser, task))
                return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("this user is already added!!!");

            tacheSer.addAssignee(AssigneeUser, task);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete/assignee")
    public ResponseEntity<?> deleteAssignee(
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
            Project p = projectSer.getProjectById(task.getProject().getId());
            if (p == null)
                return ResponseEntity.status(404).body("projet: not found");
            if (p.getCreateur().getId().equals(u.getId()) == false)
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You're not able to delete an asignee to this task");
            if (tacheSer.isMember(AssigneeUser, task) == false)
                return ResponseEntity.status(404).body("This user isn't a member of this project");
            if (tacheSer.IsUserExistInAsignee(AssigneeUser, task) == false)
                return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("this user isn't exist!!!");
            tacheSer.removeAssignee(AssigneeUser, task);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.out.println(e.getMessage());
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
            task.setAttachment(new ArrayList<>());
            task.setPrecedentes(new ArrayList<>());
            task.setPrecedentes(new ArrayList<>());

            task.setProject(p);
            task.setDateCreation(LocalDateTime.now());
            task.setRapporteur(u);
            task.setStatut(Tache.Statut.TODO);
            tacheSer.addTache(task);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.out.println(e.getMessage());
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
            System.out.println(e.getMessage());
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
            System.out.println(e.getMessage());
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
                return ResponseEntity.notFound().build();

            return ResponseEntity.ok().body(task);
        } catch (Exception e) {
            System.out.println(e.getMessage());
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
            System.out.println(e.getMessage());
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
            System.out.println(e.getMessage());
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
            System.out.println(tasks.size() + " -------------------------------------- "+ t.getId());
            return ResponseEntity.ok().body(tasks);
        } catch (Exception e) {
            System.out.println(e.getMessage());
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
            System.out.println(e.getMessage());
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
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // @PutMapping("/update/parent/{id}")
    // public ResponseEntity<?> EditParent(
    //         @RequestParam String taskID,
    //         @RequestParam String parentTaskID,
    //         @RequestHeader("Authorization") String token
    //     ) {
    //         try{
    //             User u = getUserFromToken(token);
    //             if (u == null)
    //                 return ResponseEntity.notFound().build(); // 404 Not Found
    //             Tache task = tacheSer.findTacheById(taskID);
    //             if (task == null)
    //                 return ResponseEntity.notFound().build();
    //             Tache parent = tacheSer.findTacheById(parentTaskID);
    //             if (parent == null)
    //                 return ResponseEntity.notFound().build();
    //             setPrivilege(u, null, task);
    //             if( canEditTasks == false  ) 
    //                 return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    //             tacheSer.addSousTache(parent,task);
    //             return ResponseEntity.ok(task);
    //         } catch( Exception e) {
    //             return ResponseEntity.badRequest().build();
    //         }
    // }



    @PutMapping("/update")
    public ResponseEntity<?> update(
            @RequestBody Tache task,
            @RequestHeader("Authorization") String token
        ) {
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

            //

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
                    || task.getDuree() < 0 || task.getMarge() < 0 || task.getBudgetEstime() < 0 || task.getQualite() > 5
                    || task.getQualite() < 0 || task.getDifficulte() == null)
                return ResponseEntity.status(416).build();

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
            System.out.println("-----------------------------------------------------------------------------");
            System.out.println("-----------------------------------------------------------------------------");
            System.out.println(err.getMessage());
            System.out.println("-----------------------------------------------------------------------------");
            System.out.println("-----------------------------------------------------------------------------");

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
            System.out.println(e.getMessage());
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
            
            Tache EditedTask = tacheSer.removeSubTask(task,subTask);
            return ResponseEntity.ok(EditedTask);
        } catch (Exception e) {
            System.out.println(e.getMessage());
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
            
            Tache EditedTask = tacheSer.removePrecedente(task,precTask);
            return ResponseEntity.ok(EditedTask);
        } catch (Exception e) {
            System.out.println(e.getMessage());
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
            
            Tache EditedTask = tacheSer.removeParallel(task,parallelTask);
            return ResponseEntity.ok(EditedTask);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

}
