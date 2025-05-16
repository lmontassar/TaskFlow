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
    public enum Status {
        AVAILABLE, ALLOCATED, PENDING, UNAVAILABLE
    }

    @Id
    private String id;
    private String nom;
    private String type;
    private float coutUnitaire;
    private String notes;
    private Status status;
    private String categorie;

    @Override
    public int hashCode() {
        // Hash code based on 'id' only
        return nom != null ? nom.hashCode() : 0;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Resource resource = (Resource) o;
        return this.id.equals(resource.getId());
    }
}