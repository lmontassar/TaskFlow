package com.taskflow.server.Entities;

import java.util.UUID;

import org.springframework.data.mongodb.core.mapping.Document;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;




@Document(collection = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @org.springframework.data.annotation.Id
    private String id;
    private String username;
    private String email;
    private String password;
    private String phoneNumber;

    private String nom;
    private String prenom;
    private String title;
    private String avatar;
    private String region;
}