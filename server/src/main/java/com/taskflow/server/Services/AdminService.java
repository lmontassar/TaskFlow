package com.taskflow.server.Services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {
    @Autowired
    private UserService userService;
    @Autowired
    private ProjectService projectService;
    @Autowired
    private TacheService tacheService;
    @Autowired
    private ObjectMapper objectMapper;

    public List<Project> getProjects(){
        return projectService.getAll();
    }

    public List<User> getUsers(){
        return userService.getAll();
    }
    public int getUserSize(){
        return userService.getAll().size();
    }
    public ObjectNode getProjectStats(){
        ObjectNode projectStatics = objectMapper.createObjectNode();
        projectStatics.put("all",projectService.getAllSize());
        projectStatics.put("inProgress",projectService.getInProgressSize());
        projectStatics.put("notStarted",projectService.getNotStartedSize());
        projectStatics.put("completed",projectService.getCompletedSize());
        return projectStatics;
    }
    public ObjectNode getTaskStats(){
        ObjectNode taskStat = objectMapper.createObjectNode();
        taskStat.put("all",tacheService.getAllTaskSize());
        taskStat.put("completed",tacheService.getAllCompletedTasksSize());
        return taskStat;
    }
    public Boolean isAdmin(String userId){
        return userService.findById(userId).getRole()== User.Role.ADMIN;
    }
    public ObjectNode getOverView(){
        ObjectNode projectStat = getProjectStats();
        ObjectNode taskStat = getTaskStats();
        ObjectNode overview = objectMapper.createObjectNode();
        overview.set("project",projectStat);
        overview.put("user",getUserSize());
        overview.set("task",taskStat);
        return overview;
    }
}
