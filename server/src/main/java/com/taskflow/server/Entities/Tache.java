package com.taskflow.server.Entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

@JsonIdentityInfo(
  generator = ObjectIdGenerators.PropertyGenerator.class,
  property = "id"
)
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
    private long duree;
    private long marge;

    private List<String> comments;

    @DBRef
    @JsonIgnoreProperties({ "messages"})
    private Project project;
    private List<AffectationRessource> ressources = new ArrayList<>();

    public boolean addRessource(AffectationRessource affRess) {
        for (AffectationRessource ar : ressources) {
            System.out.println(ar.getRess().getId() + "-sdklfjvgh-" + affRess.getRess().getId());
            if (ar.equals(affRess)) {
                switch (affRess.getRess().getType()) {
                    case "Temporary": {
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

    private List<Attachment> attachments = new ArrayList<>();

    @DBRef
    @JsonIgnoreProperties({ "parent", "precedentes", "paralleles", "project" ,"necessaryRessource","rapporteur" })
    private Tache parent;

    @DBRef
    @JsonIgnoreProperties({ "parent", "precedentes", "paralleles", "project" , "necessaryRessource","rapporteur"})
    private List<Tache> precedentes = new ArrayList<>();

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
    private List<User> assignee = new ArrayList<>();
    @DBRef
    private User rapporteur;

    public LocalDateTime getFirstDateDebutForMatRessource() {
        LocalDateTime earliest = null;
        for (AffectationRessource r : ressources) {
            if (r.getRess().getType().equals("Material")) {
                if (earliest == null || r.getDateDebut().isBefore(earliest)) {
                    earliest = r.getDateDebut();
                }
            }
        }
        return earliest;
    }

    public LocalDateTime getLastDateFinForMatRessource(){
        LocalDateTime latest = null;
        for (AffectationRessource r : ressources) {
            if (r.getRess().getType().equals("Material")) {
                if (latest == null || r.getDateFin().isAfter(latest)) {
                    latest = r.getDateFin();
                }
            }
        }
        return latest;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Tache tache = (Tache) o;
        return this.id.equals(tache.getId());
    }

    @Override
    public String toString() {
        return "Tache{" +
                "id='" + id + '\'' +
                ", nomTache='" + nomTache + '\'' +
                ", description='" + description + '\'' +
                ", budgetEstime=" + budgetEstime +
                ", statut=" + statut +
                ", qualite=" + qualite +
                ", difficulte=" + difficulte +
                ", dateCreation=" + dateCreation +
                ", dateDebut=" + dateDebut +
                ", dateFinEstime=" + dateFinEstime +
                ", dateFin=" + dateFin +
                ", duree=" + duree +
                ", marge=" + marge +
                ", comments=" + comments +
                ", rapporteur=" + (rapporteur != null ? rapporteur.getId() : null) +
                ", assigneeIds=" + assignee.stream().map(User::getId).toList() +
                ", nbAttachments=" + attachments.size() +
                ", nbRessources=" + ressources.size() +
                ", nbNecessaryRessources=" + necessaryRessource.size() +
                '}';
    }
}