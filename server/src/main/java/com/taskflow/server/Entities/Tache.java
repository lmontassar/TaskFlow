package com.taskflow.server.Entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
    private List<AffectationRessource> ressources = new ArrayList<>();

    public boolean addRessource(AffectationRessource affRess) {
        for (AffectationRessource ar : ressources) {
            if (ar.equals(affRess)) {
                switch (affRess.getRess().getType()) {
                    case "Temporal": {
                        ar.setQte(ar.getQte() + affRess.getQte());
                        return true;
                    }
                    case "Energetic": {
                        ar.setConsommation(ar.getConsommation() + affRess.getConsommation());
                        return true;
                    }
                    case "Material": {
                        
                        ar.setQte(ar.getQte() + affRess.getQte());
                        return true;
                    }
                }
            }
            ;
        }
        return ressources.add(affRess);
    }
    public boolean deleteRessource(AffectationRessource r) {
        return ressources.remove(r);
    }

    private List<String> attachment;

    @DBRef
    @JsonIgnoreProperties({ "parent", "precedentes", "paralleles", "project" })
    private Tache parent;

    @DBRef
    @JsonIgnoreProperties({ "parent", "precedentes", "paralleles", "project" })
    private List<Tache> precedentes;

    public boolean addPrecedente(Tache t) {
        for (Tache task : precedentes)
            if (task.equals(t))
                return false;
        return precedentes.add(t);
    }

    public boolean deletePrecedente(Tache t) {
        return precedentes.remove(t);
    }

    @DBRef
    @JsonIgnoreProperties({ "parent", "precedentes", "paralleles", "project" })
    private List<Tache> paralleles = new ArrayList<>();

    public boolean addParallele(Tache t) {
        for (Tache task : paralleles)
            if (task.equals(t))
                return false;
        return paralleles.add(t);
    }

    public boolean deleteParallele(Tache t) {
        return paralleles.remove(t);
    }

    @DBRef
    private List<NecessaryRessource> necessaryRessource = new ArrayList<>();

    public boolean addNecessaryRessource(NecessaryRessource n) {
        for (NecessaryRessource necessaryR : necessaryRessource)
            if (necessaryR.equals(n))
                return false;
        return necessaryRessource.add(n);
    }

    public boolean deleteNecessaryRessource(NecessaryRessource n) {
        return necessaryRessource.remove(n);
    }

    @DBRef
    private List<User> assignee;
    @DBRef
    private User rapporteur;

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Tache tache = (Tache) o;
        return this.id.equals(tache.getId());
    }
}
