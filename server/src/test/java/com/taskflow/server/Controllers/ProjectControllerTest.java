package com.taskflow.server.Controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.ProjectRequest;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Services.NotificationService;
import com.taskflow.server.Services.ProjectService;
import com.taskflow.server.Services.UserService;
import com.taskflow.server.Config.JWT;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(ProjectController.class)
class ProjectControllerTest {
    private final String Token = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IlVTRVIsQURNSU4iLCJpZCI6IjY3ZjFhYzA5ZDRkN2I1M2NhZWY2YzgxYyIsImFjdGl2YXRpb24iOnRydWUsImVtYWlsIjoiaGFsaW1jaG91a2FuaTNAZ21haWwuY29tIiwic3ViIjoiNjdmMWFjMDlkNGQ3YjUzY2FlZjZjODFjIiwiaWF0IjoxNzQ1ODQ3MDM4LCJleHAiOjE3NDY3MTEwMzh9.mUNwbINQqFc4K48hmRbA213mzMHVVURwCOW9aQpuMbs";
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProjectService projectService;

    @MockBean
    private UserService userService;

    @MockBean
    private JWT myJWT;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testAddProject_Success() throws Exception {
        User user = new User();
        user.setId("userId123");

        when(projectService.createProject(any(Project.class), any(User.class))).thenReturn(new Project());
        when(myJWT.generateToken(any())).thenReturn("mock-jwt-token");
        when(myJWT.validateToken(any(String.class))).thenReturn(true);
        when(myJWT.extractUserId(any(String.class))).thenReturn("userId123");
        when(userService.findById("userId123")).thenReturn(user);

        Date debut = new Date();
        debut.setMonth(5);
        Date fin = new Date();
        fin.setMonth(9);

        ProjectRequest projectRequest = new ProjectRequest();
        projectRequest.setNom("project test");
        projectRequest.setDescription("test");
        projectRequest.setDateDebut(debut);
        projectRequest.setBudgetEstime(3500F);
        projectRequest.setDateFinEstime(fin);
        projectRequest.setCreateur(user.getId());

        mockMvc.perform(post("/project/create") // Add leading slash if missing
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", Token)
                        .content(objectMapper.writeValueAsString(projectRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void testAddProject_BadRequest() throws Exception {
        User user = new User();
        user.setId("userId123");

        when(projectService.createProject(any(Project.class), any(User.class))).thenReturn(new Project());
        when(myJWT.generateToken(any())).thenReturn("mock-jwt-token");
        when(myJWT.validateToken(any(String.class))).thenReturn(true);
        when(myJWT.extractUserId(any(String.class))).thenReturn("userId123");
        when(userService.findById("userId123")).thenReturn(user);

        Date debut = new Date();
        debut.setMonth(9);
        Date fin = new Date();
        fin.setMonth(5);

        ProjectRequest projectRequest = new ProjectRequest();
        projectRequest.setNom("project test");
        projectRequest.setDescription("test");
        projectRequest.setDateDebut(debut);
        projectRequest.setBudgetEstime(3500F);
        projectRequest.setDateFinEstime(fin);
        projectRequest.setCreateur(user.getId());

        mockMvc.perform(post("/project/create") // Add leading slash if missing
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", Token)
                        .content(objectMapper.writeValueAsString(projectRequest)))
                .andExpect(status().isBadRequest());
    }
}
