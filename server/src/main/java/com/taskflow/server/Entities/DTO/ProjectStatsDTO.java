package com.taskflow.server.Entities.DTO;

import lombok.Data;

@Data
public class ProjectStatsDTO {
    private int tasks;
    private int completed;
    private int todo;
    private int progress;
    private int review;
}