package com.taskflow.server.Entities;

import java.util.List;

import lombok.Data;

@Data
public class SaveChangesRequest {
    private List<ChangeTask> result;
  private boolean optCollab;
  private boolean optResource;

  // getters + setters (or Lombok @Data)
  public List<ChangeTask> getResult()       { return result; }
  public void setResult(List<ChangeTask> r){ this.result = r; }

  public boolean isOptCollab()      { return optCollab; }
  public void setOptCollab(boolean c){ this.optCollab = c; }

  public boolean isOptResource()        { return optResource; }
  public void setOptResource(boolean r){ this.optResource = r; }
}
