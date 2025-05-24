package com.taskflow.server.Entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;
@Document(collection = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaterialResource extends Resource {
    private int utilisationTotale;
    private int qteDisponibilite;
    private int qte;
}