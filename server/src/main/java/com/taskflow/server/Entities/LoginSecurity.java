package com.taskflow.server.Entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
@Document(collection = "LoginSecurity")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class LoginSecurity {
    @Id
    private String id;
    private String email;
    private int loginAttempt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date loginAttemptDate;
}