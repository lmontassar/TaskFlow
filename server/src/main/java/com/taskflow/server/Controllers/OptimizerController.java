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

import java.util.List;
import java.util.Map;
import java.util.Objects;

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
        Boolean isCollab = Objects.equals((String) requestBody.get("optCollab"), "true");
        Boolean isResource = Objects.equals((String) requestBody.get("optResource"), "true");
        System.out.println(isCollab);
        System.out.println(isResource);
        ObjectNode optimizerRequest = optimiserService.optimise(projectId,isCollab,isResource);
        List<Map<String, Object>> opt = optimiserService.sendData(optimizerRequest,projectId);

        return ResponseEntity.ok(opt);


    }
}
