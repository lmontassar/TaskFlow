package com.taskflow.server.Entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;




@Document(collection = "taches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tache {
    public static enum Statut {
        TODO, PROGRESS, REVIEW, DONE
    }
    public static enum Difficulte {
        easy, normal, hard
   }

    @Id
    private String id; 
    private String nomTache;
    private String description; 
    private float budgetEstime;
    private Statut statut;
    private int qualite;
    private Difficulte difficulte;
    private LocalDateTime dateCreation;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFinEstime;
    private LocalDateTime dateFin;
    private int duree;
    private int marge;

    private List<String> comments;

    @DBRef
    private Project project;

    private List<String> attachment;

    @DBRef
    private Tache parent;
    @DBRef
    private List<Tache> precedentes;
    @DBRef
    private List<User> assignee;
    @DBRef
    private User rapporteur;
}
