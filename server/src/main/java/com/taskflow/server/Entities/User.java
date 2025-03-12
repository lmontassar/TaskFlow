package com.taskflow.server.Entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;



@Document(collection = "users")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class User {
    @Id
    private String id;
    private String email;
    private String password;
    private String phoneNumber;
    private String nom;
    private String prenom;
    private String title;
    private String avatar;
    private String region;
    private Boolean activation;
    private Boolean twoFactorAuth;
    private Boolean locked=false;
}