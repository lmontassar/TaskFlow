package com.taskflow.server.Entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "invitations")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Notification {
    @Id
    private String id;
    @DBRef
    private User Sender;
    @DBRef
    private Project project;
    @DBRef
    private User Receiver;
    private Boolean status = false;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date CreationDate;
}
