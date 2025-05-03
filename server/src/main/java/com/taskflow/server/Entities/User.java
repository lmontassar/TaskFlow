package com.taskflow.server.Entities;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor

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
    private LocalDateTime creationDate;
    private String bio;
    private Boolean activation;
    private Boolean twoFactorAuth;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return this.id.equals(user.getId());
    }

}