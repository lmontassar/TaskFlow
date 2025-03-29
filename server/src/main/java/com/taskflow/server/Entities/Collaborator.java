package com.taskflow.server.Entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Collaborator{
    @DBRef
    private User user;
    private String role;
    private Set<String> skills;
    private boolean disponibilite;
    private int experience;
    private int heurTravail;
}