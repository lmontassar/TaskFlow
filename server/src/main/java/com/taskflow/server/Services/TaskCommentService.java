package com.taskflow.server.Services;

import com.taskflow.server.Entities.Tache;
import com.taskflow.server.Entities.TaskComment;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Repositories.TaskCommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class TaskCommentService {
    @Autowired
    private TaskCommentRepository taskCommentRepository;

    @Autowired
    private TacheService tacheService;
    @Autowired
    private UserService userService;

    public TaskComment addComment(String content , String taskId,String userId){
        Tache tache= tacheService.findTacheById(taskId);
        if(tache==null){
            return null;
        }
        User user = userService.findById(userId);
        if(user==null){
            return null;
        }
        TaskComment taskComment = new TaskComment();
        taskComment.setTask(tache);
        taskComment.setUser(user);
        taskComment.setContent(content);
        taskComment.setCreatedAt(new Date());
        return taskCommentRepository.save(taskComment);
    }
    public TaskComment getById(String id){
        return taskCommentRepository.findById(id).orElse(null);
    }
    public List<TaskComment> getTaskCommentByTask(String taskId){
        Tache tache= tacheService.findTacheById(taskId);
        if(tache==null){
            return null;
        }
        return taskCommentRepository.findAllByTaskOrderByCreatedAtDesc(tache);
    }
    public List<TaskComment> deleteComment(String commentId,String userID){
        System.out.println("Data "+commentId + " "+ userID);
        TaskComment taskComment = getById(commentId);
        System.out.println(taskComment);
        if(taskComment == null){
            return null;
        }
        String taskId = taskComment.getTask().getId();
        if(taskComment.getUser().getId().equals(userID)){
            taskCommentRepository.deleteById(commentId);
            return getTaskCommentByTask(taskId);
        }
        return null;
    }
}
