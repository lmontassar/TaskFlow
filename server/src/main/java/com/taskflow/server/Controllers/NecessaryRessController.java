package com.taskflow.server.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import com.taskflow.server.Entities.NecessaryRessource;
import com.taskflow.server.Entities.Tache;
import com.taskflow.server.Entities.NecessaryRessource.typeRess;
import com.taskflow.server.Services.NecessaryRessourcesService;
import com.taskflow.server.Services.TacheService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/necessaryressource")
public class NecessaryRessController {

    @Autowired
    private NecessaryRessourcesService necRessSer;

    @Autowired
    private TacheService tacheService;

    @PostMapping("/add")
    public ResponseEntity<?> addNecessaryRessource(
            @RequestHeader("Authorization") String token,
            @RequestParam String TaskID,
            @RequestParam typeRess type,
            @RequestParam String name,
            @RequestParam String categorie,
            @RequestParam float qte) {
        try {
            Tache tache = tacheService.findTacheById(TaskID);
            if (tache == null)
                return ResponseEntity.notFound().build();
            NecessaryRessource ress = new NecessaryRessource();
            ress.setCategorie(categorie);
            ress.setName(name);
            ress.setType(type);
            ress.setQte(qte);
            NecessaryRessource NewRess = necRessSer.create(ress);
            Tache updatedTask = tacheService.addNecessaryRessource(NewRess, tache);
            if (updatedTask == null)
                throw new Exception();
            return ResponseEntity.ok().body(NewRess);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/edit")
    public ResponseEntity<?> EditNecessaryRessource(
            @RequestHeader("Authorization") String token,
            @RequestParam String RessourceID,
            @RequestParam typeRess type,
            @RequestParam String name,
            @RequestParam String categorie,
            @RequestParam float qte) {
        try {
            NecessaryRessource ress = necRessSer.getById(RessourceID);
            ress.setCategorie(categorie);
            ress.setName(name);
            ress.setType(type);
            ress.setQte(qte);
            NecessaryRessource updatedRess = necRessSer.update(ress);
            if (updatedRess == null)
                throw new Exception();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> DeleteNecessaryRessource(
            @RequestHeader("Authorization") String token,
            @RequestParam String RessourceID,
            @RequestParam String TaskID
            ) {
        try {
            Tache task = tacheService.findTacheById(TaskID);
            NecessaryRessource ress = necRessSer.getById(RessourceID);
            tacheService.removeNecessaryRessource(task,ress);
            necRessSer.delete(ress);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

}