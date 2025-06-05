package com.taskflow.server;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.server.Config.JWT;
import com.taskflow.server.Controllers.AIChatController;
import com.taskflow.server.Controllers.TacheController;
import com.taskflow.server.Entities.AIChat;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.ProjectRequest;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Services.AIChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(AIChatController.class)
public class AIChatControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private AIChatService aiChatService;

    @MockBean
    private JWT myJWT;
    
    
    private final String Token = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IlVTRVIsQURNSU4iLCJpZCI6IjY4MTNhZjcwMTFmYzJhNTRkMDhiNTI0NyIsImFjdGl2YXRpb24iOnRydWUsImVtYWlsIjoibW9udGFzc2FyOTAwMEBnbWFpbC5jb20iLCJzdWIiOiI2ODEzYWY3MDExZmMyYTU0ZDA4YjUyNDciLCJpYXQiOjE3NDc4NTUyMTMsImV4cCI6MTc0ODcxOTIxM30.rs2cbsZSr7WOlilj8NVRNY2bfaMfhnY0o_iF1GX0gPg";

    @Test
    void testSendMessage() throws Exception {
        String message = "Hello !";
        AIChat aiChat = new AIChat();
        aiChat.setId("123");
        aiChat.setTitle("Hello");
        Project project = new Project();
        project.setId("123");
        User user = new User();
        user.setId("123");
        when(aiChatService.initialiseConversation(project.getId(), user.getId())).thenReturn(aiChat);
        when(aiChatService.getById("123")).thenReturn(aiChat);
        when(aiChatService.cleanMessage(message,aiChat)).thenReturn(message);
        Map<String,Object> request = new HashMap<>();
        request.put("message",message);
        request.put("AIChatId",aiChat.getId());
        request.put("projectID",project.getId());
        mockMvc.perform(post("/ai-chat/stream")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization",Token)
                        .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}
