package com.taskflow.server.Controllers;

import com.taskflow.server.Entities.DTO.AnalyticsKpisDTO;
import com.taskflow.server.Entities.DTO.PerformanceTrendDTO;
import com.taskflow.server.Entities.DTO.TaskStatusStatsDTO;
import com.taskflow.server.Services.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    // AnalyticsController.java
    @GetMapping("/kpis")
    public ResponseEntity<AnalyticsKpisDTO> getAnalyticsKpis(
            @RequestParam(required = false) String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate) {

        try {
            // Handle null dates
            Date[] dates = parseDateRange(timeRange, startDate, endDate);
            if (dates[0] == null || dates[1] == null) {
                return ResponseEntity.badRequest().build();
            }

            AnalyticsKpisDTO kpis = analyticsService.getKpis(dates[0], dates[1]);
            return ResponseEntity.ok(kpis);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/task-status")
    public List<TaskStatusStatsDTO> getTaskStatus(
            @RequestParam(required = false) String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate) {

        try {
            Date[] dates = parseDateRange(timeRange, startDate, endDate); // reuse your existing helper
            return analyticsService.getTaskStatusStats(dates[0], dates[1]);
        } catch (Exception e) {
            e.printStackTrace(); // <— prints full stack
            throw e; // or return a 500 response
        }

    }

    @GetMapping("/project-status")
    public List<TaskStatusStatsDTO> getProjectStatus(
            @RequestParam(required = false) String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate) {
        try {
            Date[] dates = parseDateRange(timeRange, startDate, endDate);
            return analyticsService.getProjectStatusStats(dates[0], dates[1]);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    private Date[] parseDateRange(String timeRange, Date start, Date end) {
        // Add logic to handle timeRange (e.g., "30d" = last 30 days)
        // Default to all time if no params provided
        if (start == null || end == null) {
            end = new Date();
            start = new Date(end.getTime() - (30L * 24 * 60 * 60 * 1000)); // Default 30 days
        }
        return new Date[] { start, end };
    }
}