package com.taskflow.server.Entities;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Id;

import org.springframework.data.mongodb.core.mapping.Document;



@Document(collection = "NecessaryResources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NecessaryRessource {
    public static enum typeRess {
        Temporary, Material, Energetic
    }

    @Id
    private String id;
    private String name ;
    private typeRess type;
    private String categorie;
    private float qte;


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        NecessaryRessource tache = (NecessaryRessource ) o;
        return this.id.equals(tache.getId());
    }
}