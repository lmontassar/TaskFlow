package com.taskflow.server.Entities.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeamPerformanceDTO {
    private String userId;
    private String userName;
    private String role;
    private long tasksAssigned;
    private long tasksCompleted;
    private double completionRate;
    private double avgTaskDuration;
    private double totalBudgetManaged;
    private double qualityScore;
}