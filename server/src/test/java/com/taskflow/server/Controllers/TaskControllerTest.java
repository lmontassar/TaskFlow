package com.taskflow.server.Controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.MaterialResource;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.Tache;
import com.taskflow.server.Services.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(TacheController.class)
public class TaskControllerTest {
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
    void testAssignResourceToTask_Success()throws Exception{
        MaterialResource resource = new MaterialResource();
        resource.setId("ResourceId123");
        resource.setType("Material");
        Project project = new Project();
        project.setId("P123");
        Tache task = new Tache();
        task.setId("T123");
        task.setProject(project);
        when(resourceService.getById("ResourceId123")).thenReturn(resource);
        when(tacheService.findTacheById("T123")).thenReturn(task);
        when(tacheService.qteAvailableMaterialRess(any(),any(),any(),any())).thenReturn(8);
        when(tacheService.update(any())).thenReturn(task);

        mockMvc.perform(post("/tache/add/ressource")
                .param("taskID","T123")
                .param("ressourceID","ResourceId123")
                .param("qte","2")
                .param("dateDebut","2025-05-01T10:00:00")
                .param("dateFin","2025-05-02T10:00:00")
                .header("Authorization",Token)
        ).andExpect(status().isOk());
    }
}
