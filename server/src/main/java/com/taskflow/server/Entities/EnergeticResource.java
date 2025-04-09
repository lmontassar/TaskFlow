package com.taskflow.server.Entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnergeticResource extends Resource {
    private String unitMeasure;
    private float consommationTotale;
    private float consommationMax;
}
