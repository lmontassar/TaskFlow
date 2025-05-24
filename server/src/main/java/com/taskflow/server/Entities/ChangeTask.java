package com.taskflow.server.Entities;
import com.taskflow.server.Entities.DTO.TaskDto;

import lombok.Data;
@Data
public class ChangeTask {
    private TaskDto oldData;
    private boolean hasChanges;
    private String name;
    private String id;
    private TaskDto newData;
}