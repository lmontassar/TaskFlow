package com.taskflow.server.Controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.server.Entities.*;
import com.taskflow.server.Services.*;
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
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(ResourceController.class)
class ResourceControllerTest {
    private final String Token = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IlVTRVIsQURNSU4iLCJpZCI6IjY4MTNhZjcwMTFmYzJhNTRkMDhiNTI0NyIsImFjdGl2YXRpb24iOnRydWUsImVtYWlsIjoibW9udGFzc2FyOTAwMEBnbWFpbC5jb20iLCJzdWIiOiI2ODEzYWY3MDExZmMyYTU0ZDA4YjUyNDciLCJpYXQiOjE3NDc4NTUyMTMsImV4cCI6MTc0ODcxOTIxM30.rs2cbsZSr7WOlilj8NVRNY2bfaMfhnY0o_iF1GX0gPg";
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProjectService projectService;
    @MockBean
    private ResourceService resourceService;

    @MockBean
    private TacheService tacheService;

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
    void testAddResourceMaterial_Success() throws Exception {
        User user = new User();
        user.setId("user123");
        Project project = new Project();
        project.setId("project123");
        project.setCreateur(user);
        when(myJWT.generateToken(any())).thenReturn("mock-jwt-token");
        when(myJWT.validateToken(any(String.class))).thenReturn(true);
        when(myJWT.extractUserId(any(String.class))).thenReturn("user123");
        when(userService.findById("user123")).thenReturn(user);
        when(resourceService.createMaterialResource(any())).thenReturn(new MaterialResource());
        when(projectService.getProjectById("project123")).thenReturn(project);
        when(projectService.isCreator("user123",project)).thenReturn(true);
        when(projectService.addResource(any(),any())).thenReturn(project);
        Map<String,Object> requestBody = new HashMap<>();
        requestBody.put("projectId",project.getId());
        requestBody.put("notes","note test");
        requestBody.put("nom","Resource Test");
        requestBody.put("type","Material");
        requestBody.put("categorie","Categorie Test");
        requestBody.put("coutUnitaire",900);
        requestBody.put("qte",1);

        mockMvc.perform(post("/resources/create")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization",Token)
                .content(objectMapper.writeValueAsString(requestBody))
        ).andExpect(status().isOk());
    }




}
