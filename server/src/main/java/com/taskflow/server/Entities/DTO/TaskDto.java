package com.taskflow.server.Entities.DTO;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class TaskDto {
  private LocalDateTime startDate;
  private LocalDateTime endDate;
  private String name;
  private String id;
  private List<ResourceDto> resources = new ArrayList<>();
  private List<CollaboratorDto> collaborator = new ArrayList<>();
}
