package com.taskflow.server.Entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.*;


@Document(collection = "AIChat")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AIChat {
    @Id
    private String id;
    private String title = "New Conversation";
    @DBRef
    private User user;

    @DBRef
    private Project project;

    private String model = "llama3-70b-8192";
    private LocalDateTime timestamp = LocalDateTime.now();
    private List<Map<String,Object>> messageList = new ArrayList<>();
}
