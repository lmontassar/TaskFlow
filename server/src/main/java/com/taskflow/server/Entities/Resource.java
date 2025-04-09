package com.taskflow.server.Entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {
    @Id
    private String id;
    private String nom;
    private String type;
    private float coutUnitaire;

}
