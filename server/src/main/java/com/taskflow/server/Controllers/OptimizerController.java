package com.taskflow.server.Controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Services.AIChatService;
import com.taskflow.server.Services.OptimiserService;
import com.taskflow.server.Services.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/optimise")
@RequiredArgsConstructor
public class OptimizerController {
    @Autowired
    private OptimiserService optimiserService;


    @Autowired
    private JWT myJWT;


    @PostMapping(value = "/")
    public ResponseEntity<?> streamChat(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> requestBody) throws InterruptedException, JsonProcessingException {
        String projectId = (String)requestBody.get("projectID");
        ObjectNode optimizerRequest = optimiserService.optimise(projectId);
        ObjectNode opt = optimiserService.sendData(optimizerRequest);
        if(opt!=null && opt.get("schedule")!=null){
            return ResponseEntity.ok(opt);
        }
        return ResponseEntity.notFound().build();

    }
}
