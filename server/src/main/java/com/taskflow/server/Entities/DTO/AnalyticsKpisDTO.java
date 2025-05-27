package com.taskflow.server.Entities.DTO;

import lombok.Data;

@Data
public class AnalyticsKpisDTO {
    private Long totalTasks;
    private Long completedTasks;
    private Double completionRate;
    private Double totalBudget;
    private Double spentBudget;
    private Double budgetUtilization;
    private Long activeUsers;
    private Long onlineUsers;
    private Long activeProjects;
    private Long overdueTasks;
    private Long highRiskTasks;
    private Double avgTaskDuration; // Days as Double
}