package com.taskflow.server.Entities.DTO;

import lombok.Data;

@Data
public class ResourceDto {
  private String id;
  private String name;
  private int quantity;
}