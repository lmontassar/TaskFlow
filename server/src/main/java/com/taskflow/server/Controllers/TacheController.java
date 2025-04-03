package com.taskflow.server.Controllers;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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

    private static final Pattern XSS_PATTERN = Pattern.compile("[<>\"'%;)(&+]");
    @Autowired
    private ProjectService projectSer;
    
    @Autowired
    private TacheService tacheSer;

    @Autowired
    private UserService userService;
    
    @Autowired
    private JWT myJWT;


    @PostMapping("/add")
    public ResponseEntity<?> addTache(
            @RequestBody Tache task,
            @RequestHeader("Authorization") String token
        ) {
            try{
                
                String s = myJWT.extractUserId(token);
                User u = userService.findById(s);
                if (u == null) {
                    return ResponseEntity.notFound().build(); // 404 Not Found
                }
                Project p = projectSer.getProjectById(task.getProject().getId());
                if(p == null) return ResponseEntity.notFound().build();
                if( p.getCreateur().getId().equals(u.getId()) == false ) return  ResponseEntity.status(HttpStatus.FORBIDDEN).build();

                if (             
                (   
                    task.getNomTache() == null ||
                    task.getNomTache().isEmpty() ||
                    task.getNomTache().length() > 255 ||
                    XSS_PATTERN.matcher((task.getNomTache())).find() 
                )
                ||
                (
                    (task.getDescription() != null && !task.getDescription().isEmpty())  && 
                    ( 
                        task.getDescription().length() > 1000 ||
                        XSS_PATTERN.matcher((task.getDescription())).find()
                    )
                ) 
                ||
                (   
                    task.getDateDebut() != null && task.getDateFinEstime() != null &&
                    task.getDateFinEstime().isBefore(task.getDateDebut())
                )
                || task.getDuree() < 0 || task.getMarge()<0 || task.getBudgetEstime() < 0)
                    return ResponseEntity.status(416).build();

                task.setAssignee(new ArrayList<>());
                task.setComments(new ArrayList<>());
                task.setAttachment(new ArrayList<>());
                task.setPrecedentes(new ArrayList<>());
                task.setPrecedentes(new ArrayList<>());
                
                task.setProject(p);
                task.setDateCreation( LocalDateTime.now() );
                task.setRapporteur(u);
                task.setStatut( Tache.Statut.TODO);
                tacheSer.addTache(task);
                return ResponseEntity.ok().build();
            } catch(Exception e) {
                System.out.println(e.getMessage());
                return ResponseEntity.badRequest().build();
            }
    }

    @GetMapping("/get")
    public ResponseEntity<?> getTasks(
        //@RequestHeader("Authorization") String token
    ) {
        try{
            List<Tache> listTaches = tacheSer.findTaches();
            return ResponseEntity.ok().body(listTaches);
        } catch(Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    @GetMapping("/get/{id}")
    public ResponseEntity<?> getTasks(
            @RequestHeader("Authorization") String token,
            @PathVariable("id") String id
    ) {
        try{
            Tache task = tacheSer.findTacheById(id);
            if (task == null ) return ResponseEntity.notFound().build();
            return ResponseEntity.ok().body(task);
        } catch(Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    @GetMapping("/get/project/{id}")
    public ResponseEntity<?> getByProject(
        @RequestHeader("Authorization") String token,
        @PathVariable("id") String id
    ) {
        try{
            Project p = projectSer.getProjectById(id);
            List<Tache> tasks = tacheSer.findTacheByProjectId(p);
            if (tasks == null ) return ResponseEntity.notFound().build();
            return ResponseEntity.ok().body(tasks);
        } catch(Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/update/statut")
    public ResponseEntity<?> updateStatut(
            @RequestParam("taskID") String taskID,
            @RequestParam("statut") Tache.Statut statut,
            @RequestHeader("Authorization") String token
        ) {
            try{
                String s = myJWT.extractUserId(token);
                User u = userService.findById(s);
                if (u == null) {
                    return ResponseEntity.notFound().build(); // 404 Not Found
                }
                Tache task = tacheSer.findTacheById(taskID);
                if(task == null) return ResponseEntity.notFound().build();

                if( tacheSer.IsUserExistInAsignee(u,task) && tacheSer.isCreateur(u, task) ) // IF not Assignee and not creator return 403  
                    return  ResponseEntity.status(HttpStatus.FORBIDDEN).build();

                //if( p.getCreateur().getId().equals(u.getId()) == false ) return  ResponseEntity.status(HttpStatus.FORBIDDEN).build();


                Tache OldTask = tacheSer.findTacheById(taskID);
                if(OldTask == null ) ResponseEntity.notFound().build();
                Tache updatedTask = tacheSer.updateStatus(OldTask,statut);
                if(updatedTask == null) return ResponseEntity.ok().build();
                return ResponseEntity.ok().body(updatedTask); 
            } catch (Exception e) {
                System.out.println(e.getMessage());
                return ResponseEntity.badRequest().build();
            }
    }
    
    
    @PutMapping("/update")
    public ResponseEntity<?> update(
        @RequestBody Tache task,
        @RequestHeader("Authorization") String token
    ) {
        try{
            // TODO
            // CHECK IF THIS USER HAVE ACCESS TO UPDATE THIS TASK
            String s = myJWT.extractUserId(token);
            User u = userService.findById(s);
            if (u == null) {
                return ResponseEntity.notFound().build(); // 404 Not Found
            }
            Tache oldTask = tacheSer.findTacheById(task.getId());
            if(oldTask == null) return  ResponseEntity.notFound().build();

            if( tacheSer.isCreateur(u, oldTask) ) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            //

            if (             
                (   
                    task.getNomTache() == null ||
                    task.getNomTache().isEmpty() ||
                    task.getNomTache().length() > 255 ||
                    XSS_PATTERN.matcher((task.getNomTache())).find() 
                )
                ||
                (
                    (task.getDescription() != null && !task.getDescription().isEmpty())  && 
                    ( 
                        task.getDescription().length() > 1000 ||
                        XSS_PATTERN.matcher((task.getDescription())).find()
                    )
                ) 
                ||
                (   
                    task.getDateDebut() != null && task.getDateFinEstime() != null &&
                    task.getDateFinEstime().isBefore(task.getDateDebut())
                )
                || task.getDuree() < 0 || task.getMarge()<0 || task.getBudgetEstime() < 0 || task.getQualite()>5 ||task.getQualite()<0 || task.getDifficulte() == null)
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
                Tache newTask =  tacheSer.update(oldTask);
                return ResponseEntity.ok().body(newTask);

        }catch(Exception error){
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> delete(
        @RequestParam("taskID") String taskID,
        @RequestHeader("Authorization") String token
    ){
        try{



            Tache OldTask = tacheSer.findTacheById(taskID);
            if(OldTask == null ) ResponseEntity.notFound().build();
            tacheSer.delete(OldTask);
            return ResponseEntity.ok().build(); 
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }


}
