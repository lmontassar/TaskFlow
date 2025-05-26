package com.taskflow.server.Entities.DTO;

import lombok.Data;

@Data
public class ProjectsStatsDTO {
    private int projects;
    private int notStartedProjects;
    private int activeProjects;
    private int completedProjects;
    private int createdThisMonth;
    private int budgets;
}
