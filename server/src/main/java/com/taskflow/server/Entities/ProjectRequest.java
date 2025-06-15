package com.taskflow.server.Entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProjectRequest {
    private String nom;
    private String description;
    private float budgetEstime;
    private Date dateDebut;
    private Date dateFinEstime;
    private Set<String> tags;
    private String createur;
}
