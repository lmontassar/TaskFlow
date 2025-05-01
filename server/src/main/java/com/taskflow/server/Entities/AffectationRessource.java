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
        AffectationRessource ress = (AffectationRessource) o;
        if (ress.getRess().getType() .equals("Material")  && this.getRess().getType() .equals("Material") ) {
            return this.getRess().equals(ress.getRess())
                    && this.getDateDebut().isEqual(ress.getDateDebut()) && this.getDateFin().isEqual(ress.getDateFin());
        }
        return this.getRess().equals(ress.getRess());
    }
}