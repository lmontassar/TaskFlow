package com.taskflow.server.Controllers;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Services.AdminService;
import com.taskflow.server.Services.ProjectService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    @Autowired
    private AdminService adminService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private JWT myJWT;

    @GetMapping("/overview")
    public ResponseEntity<?> getOverView(@RequestHeader("Authorization") String token) {
        String userId = myJWT.extractUserId(token);
        if (!adminService.isAdmin(userId)) {
            return ResponseEntity.status(403).build();
        }
        ObjectNode overview = adminService.getOverView();
        return ResponseEntity.status(200).body(overview);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(@RequestHeader("Authorization") String token) {
        String userId = myJWT.extractUserId(token);
        if (!adminService.isAdmin(userId)) {
            return ResponseEntity.status(403).build();
        }
        List<User> users = adminService.getUsers();
        return ResponseEntity.status(200).body(users);
    }

    @GetMapping("/projects/stats")
    public ResponseEntity<?> getAllProjectStats(@RequestHeader("Authorization") String token) {
        String userId = myJWT.extractUserId(token);
        if (!adminService.isAdmin(userId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.status(200).body(projectService.getStatsAllProjects());
    }

    @GetMapping("/projects")
    public ResponseEntity<?> getAllProjects(@RequestHeader("Authorization") String token) {
        String userId = myJWT.extractUserId(token);
        if (!adminService.isAdmin(userId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.status(200).body(projectService.getAllProjectsV2());
    }

}