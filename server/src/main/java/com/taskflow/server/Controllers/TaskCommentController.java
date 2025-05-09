package com.taskflow.server.Controllers;

import com.taskflow.server.Entities.TaskComment;
import com.taskflow.server.Services.TaskCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/task-comment")
@RequiredArgsConstructor
public class TaskCommentController {
    @Autowired
    private TaskCommentService taskCommentService;

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

    }



}
