package com.taskflow.server.Services;

import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.DTO.AnalyticsKpisDTO;
import com.taskflow.server.Entities.DTO.PerformanceTrendDTO;
import com.taskflow.server.Entities.DTO.TaskStatusStatsDTO;
import com.taskflow.server.Repositories.ProjectRepository;
import com.taskflow.server.Repositories.TacheRepository;
import com.taskflow.server.Repositories.TacheRepository.TaskStatsAggregation;
import com.taskflow.server.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class AnalyticsService {

    @Autowired
    private TacheRepository tacheRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    // public List<PerformanceTrendDTO> getPerformanceTrends(Date startDate, Date
    // endDate, String groupBy) {
    // // Determine date format based on groupBy ('day' or 'week')
    // String format;
    // if ("week".equalsIgnoreCase(groupBy)) {
    // format = "%Y-%U"; // year-weekNumber
    // } else {
    // format = "%Y-%m-%d"; // full date
    // }
    // return tacheRepository.getPerformanceTrends(startDate, endDate, format);
    // }

    public List<TaskStatusStatsDTO> getTaskStatusStats(Date startDate, Date endDate) {
        List<TaskStatusStatsDTO> agg = tacheRepository.getTaskStatusAggregation(startDate, endDate);
        long total = agg.stream().mapToLong(TaskStatusStatsDTO::getCount).sum();

        return agg.stream()
                .peek(dto -> dto.setPercentage(total > 0
                        ? dto.getCount() * 100.0 / total
                        : 0.0))
                .toList();
    }

    public List<TaskStatusStatsDTO> getProjectStatusStats(Date startDate, Date endDate) {
        List<TaskStatusStatsDTO> agg = projectRepository.getProjectStatusAggregation(startDate, endDate);
        long total = agg.stream().mapToLong(TaskStatusStatsDTO::getCount).sum();
        return agg.stream()
                .peek(dto -> dto.setPercentage(total > 0 ? dto.getCount() * 100.0 / total : 0.0))
                .toList();
    }

    public AnalyticsKpisDTO getKpis(Date startDate, Date endDate) {
        AnalyticsKpisDTO dto = new AnalyticsKpisDTO();

        // Task stats with null handling
        TacheRepository.TaskStatsAggregation taskStats = tacheRepository.getTaskStats(startDate, endDate);

        if (taskStats == null) {
            taskStats = new TaskStatsAggregation();
        }

        dto.setTotalTasks(taskStats.getTotalTasks() != null ? taskStats.getTotalTasks() : 0L);
        dto.setCompletedTasks(taskStats.getCompletedTasks() != null ? taskStats.getCompletedTasks() : 0L);
        dto.setSpentBudget(taskStats.getSpentBudget() != null ? taskStats.getSpentBudget() : 0.0);
        dto.setOverdueTasks(taskStats.getOverdueTasks() != null ? taskStats.getOverdueTasks() : 0L);
        dto.setHighRiskTasks(taskStats.getHighRiskTasks() != null ? taskStats.getHighRiskTasks() : 0L);
        dto.setAvgTaskDuration(
                taskStats.getAvgDuration() != null ? (taskStats.getAvgDuration() / 86400000.0) : 0.0);

        Double totalBudget = projectRepository.getTotalBudget(startDate, endDate);
        dto.setTotalBudget(totalBudget != null ? totalBudget : 0.0);

        // Calculate rates with null checks
        if (dto.getTotalTasks() > 0) {
            dto.setCompletionRate(dto.getCompletedTasks().doubleValue() / dto.getTotalTasks().doubleValue());
        } else {
            dto.setCompletionRate(0.0);
        }

        if (dto.getTotalBudget() > 0) {
            dto.setBudgetUtilization(dto.getSpentBudget() / dto.getTotalBudget());
        } else {
            dto.setBudgetUtilization(0.0);
        }

        // User metrics
        dto.setActiveUsers(userRepository.countByLastOnlineBetween(startDate, endDate));
        dto.setOnlineUsers(userRepository.countByOnlineIsTrue());

        // Project status count
        dto.setActiveProjects(projectRepository.countByStatus(Project.Status.IN_PROGRESS));

        return dto;
    }
}