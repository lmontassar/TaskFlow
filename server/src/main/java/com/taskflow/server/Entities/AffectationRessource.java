package com.taskflow.server.Entities;

import java.time.LocalDateTime;

import org.springframework.data.mongodb.core.mapping.DBRef;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AffectationRessource {
    
    @DBRef
    private Resource ress;
    private int qte;
    private float consommation;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        AffectationRessource ress1 = (AffectationRessource) o;
        if (ress1.getRess().getType() .equals("Material")  && this.getRess().getType() .equals("Material") ) {
            return this.getRess().equals(ress1.getRess())
                    && this.getDateDebut().isEqual(ress1.getDateDebut()) && this.getDateFin().isEqual(ress1.getDateFin());
        }
        return this.getRess().getId().equals(ress1.getRess().getId());
    }
}