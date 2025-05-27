package com.taskflow.server.Entities.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTaskDurationDTO {
    private int month;
    private int year;
    private double averageDurationInDays;
    private long count;
}

