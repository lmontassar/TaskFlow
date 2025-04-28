package com.taskflow.server.Entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProjectUpdateRequest {
    private String id;
    private String nom;
    private String description;
    private float budgetEstime;
    private LocalDateTime dateDebut;
    private LocalDateTime  dateFinEstime;
}
