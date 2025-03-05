package com.taskflow.server.Entities;

import java.util.Date;

import javax.persistence.Id;

import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "OTPVerification")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class OTPVerification {
    @Id
    private String id;
    private String email;
    private String code;
    private Date date;
    private int attempt;
}
