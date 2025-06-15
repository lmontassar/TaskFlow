package com.taskflow.server.Services;

import com.taskflow.server.Entities.*;
import com.taskflow.server.Repositories.TaskCommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.regex.*;
import java.util.*;


@Service
public class TaskCommentService {
    @Autowired
    private TaskCommentRepository taskCommentRepository;

    @Autowired
    private TacheService tacheService;
    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    public TaskComment addComment(String content , String taskId,String userId){
        Tache tache= tacheService.findTacheById(taskId);
        if(tache==null){
            return null;
        }
        User user = userService.findById(userId);
        if(user==null){
            return null;
        }
        content = cleanComment(content,user,tache);
        TaskComment taskComment = new TaskComment();
        taskComment.setTask(tache);
        taskComment.setUser(user);
        taskComment.setContent(content);
        taskComment.setCreatedAt(new Date());
        return taskCommentRepository.save(taskComment);
    }
    public String cleanComment(String comment, User sender, Tache task) {
        if (comment == null || comment.isEmpty()) {
            return comment;
        }

        Pattern pattern = Pattern.compile("@(\\S+)");
        Matcher matcher = pattern.matcher(comment);
        StringBuffer result = new StringBuffer();

        while (matcher.find()) {
            String userId = matcher.group(1); // extract the ID without @
            User user = userService.findById(userId); // assumes your UserService returns Optional<User>
            notificationService.CreateNotification(sender,user,task.getProject(), Notification.Type.MENTION,"",task);

            String replacement;
            replacement = "@" + user.getNom() + "_" + user.getPrenom();
            replacement = replacement.replace(" ","_");

            matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
        }

        matcher.appendTail(result);
        return result.toString();
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
        TaskComment taskComment = getById(commentId);
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
    public TaskComment editComment(String commentId,String userID,String content){

        TaskComment taskComment = getById(commentId);
        if(taskComment == null){
            return null;
        }
        content = cleanComment(content,taskComment.getUser(),taskComment.getTask());
        if(taskComment.getUser().getId().equals(userID)){
            if(!content.isEmpty()){
                taskComment.setContent(content);
                return taskCommentRepository.save(taskComment);
            }
        }
        return null;
    }
}
