package com.taskflow.server.Entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "notifications")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Notification {
    public enum Type{
        COMMENT,INVITATION,MENTION,TASK,SYSTEM,JOINED
    }
    @Id
    private String id;
    private String title;
    private String description;
    private Type type;
    @DBRef
    private Project project;
    @DBRef
    private User sender;
    @DBRef
    private User receiver;
    private Boolean read = false;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date creationDate;
}
