package com.taskflow.server.Entities.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PerformanceTrendDTO {
    private String date;
    private long velocity;
    private double quality;
    private double efficiency;
    private long burndown;
}
