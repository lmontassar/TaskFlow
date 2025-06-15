package com.taskflow.server.Entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.util.HashSet;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Collaborator{
    @DBRef
    private User user;
    private String role;
    private Set<Competance> competances = new HashSet<>();
    private boolean disponibilite;
    private int heurTravail;
}
