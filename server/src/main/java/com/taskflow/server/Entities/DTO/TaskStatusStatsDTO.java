package com.taskflow.server.Entities.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskStatusStatsDTO {
    private String status;
    private long count;
    private double percentage;
    private double totalBudget;
}
