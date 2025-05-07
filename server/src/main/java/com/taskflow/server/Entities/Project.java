package com.taskflow.server.Entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.persistence.Id;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Set;

@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Document(collection = "projects")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Project {
    public enum Status {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED;
    }
    @Id
    private String id;
    private String nom;
    private String description;
    private float budgetEstime;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date dateDebut;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date dateFinEstime;
    private Set<Collaborator> listeCollaborateur;
    @DBRef
    private Set<Resource> listeRessource ;
    private Status status;
    @DBRef
    private User createur;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date dateCreation;
    private Set<String> tags;

    @DBRef
    private List<Message> messages = new ArrayList<>();
    public boolean addMessages(Message m ) {
        if(messages.contains(m)) return false;
        return messages.add(m);
    }
    public boolean deleteMessages(Message m ) {
        return messages.remove(m);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Project project = (Project ) o;
        return this.id.equals(project.getId());
    }
}
