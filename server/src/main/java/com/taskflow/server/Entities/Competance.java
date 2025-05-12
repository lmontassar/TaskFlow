package com.taskflow.server.Entities;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Competance {
    @Id
    private String id;
    private String titre;
    private int niveau;

}
