package com.taskflow.server.Services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.taskflow.server.Entities.DTO.MonthlyTaskDurationDTO;
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
    public ArrayNode getUsersStats(){
        List<User> users = getUsers();
        ArrayNode usersNode = objectMapper.createArrayNode();
        for(User user:users){
            ObjectNode u = objectMapper.createObjectNode();
            u.put("id",user.getId());
            u.put("nom",user.getNom());
            u.put("prenom",user.getPrenom());
            u.put("email",user.getEmail());
            u.put("activation",user.getActivation());
            u.put("role",user.getRole().toString());
            u.put("creationDate",user.getCreationDate().toString());
            u.put("avatar",user.getAvatar());
            u.put("block",user.getBlocked());
            u.put("projects",projectService.getAllMyProjects(user.getId()).size());
            usersNode.add(u);
        }
        return usersNode;
    }

    public void blockUser(String user){
        userService.changeBlocked(user,true);
    }
    public void unblockUser(String user){
        userService.changeBlocked(user,false);
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
        List<MonthlyTaskDurationDTO> monthlyTaskDurationDTOS = tacheService.getMonthlyAverageDurations();
        ArrayNode monthlyTaskDurationNode = objectMapper.createArrayNode();
        for (MonthlyTaskDurationDTO mtd :
                monthlyTaskDurationDTOS) {
            ObjectNode mtdNode = objectMapper.createObjectNode();
            mtdNode.put("month",mtd.getMonth());
            mtdNode.put("year",mtd.getYear());
            mtdNode.put("averageDuration",mtd.getAverageDurationInDays());
            mtdNode.put("count",mtd.getCount());
            monthlyTaskDurationNode.add(mtdNode);
        }
        overview.set("taskDurations",monthlyTaskDurationNode);
        return overview;
    }
}
