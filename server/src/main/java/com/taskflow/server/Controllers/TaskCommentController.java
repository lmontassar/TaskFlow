package com.taskflow.server.Controllers;

import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.TaskComment;
import com.taskflow.server.Services.TaskCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/task-comment")
@RequiredArgsConstructor
public class TaskCommentController {
    @Autowired
    private TaskCommentService taskCommentService;
    @Autowired
    private JWT myJWT;
    @PostMapping("/add")
    private ResponseEntity<?> addComment(@RequestHeader("Authorization") String token, @RequestBody Map<String,Object> requestBody){
        String content = (String) requestBody.get("content");
        if(content.trim().isEmpty()){
            return ResponseEntity.badRequest().build();
        }
        String taskId = (String) requestBody.get("taskId");
        if(taskId.isEmpty()){
            return ResponseEntity.badRequest().build();
        }
        String userId = myJWT.extractUserId(token);
        TaskComment taskComment = taskCommentService.addComment(content,taskId,userId);

        if(taskComment==null){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().body(taskComment);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getComments(@RequestHeader("Authorization") String token, @PathVariable String id){
        if(id.trim().isEmpty()){
            return ResponseEntity.badRequest().build();
        }
        List<TaskComment> taskCommentList = taskCommentService.getTaskCommentByTask(id);
        return ResponseEntity.ok().body(taskCommentList);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@RequestHeader("Authorization") String token, @PathVariable String id){
        if(id.trim().isEmpty()){
            return ResponseEntity.badRequest().build();
        }
        String userId= myJWT.extractUserId(token);
        List<TaskComment> taskCommentList = taskCommentService.deleteComment(id,userId);
        if(taskCommentList==null){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(taskCommentList);
    }


}
