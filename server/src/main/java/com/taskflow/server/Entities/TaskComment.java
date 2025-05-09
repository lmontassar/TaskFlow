package com.taskflow.server.Entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "taskComment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskComment {
}
