package com.taskflow.server;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.LoginRequest;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Services.OTPVerificationService;
import com.taskflow.server.Services.UserService;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.util.Optional;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private UserService userService;
    @MockBean
    private JWT jwt;
    @MockBean
    private OTPVerificationService otpVerificationService;
    

    // cas nominal:
    @Test
    void testSignUp_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile("image", "avatar.jpg", "image/jpeg", "imagecontent".getBytes());
        when(userService.createUser(any(User.class))).thenReturn(new User());
        when(otpVerificationService.setCode(anyString())).thenReturn(0);
        when(jwt.generateToken(any())).thenReturn("mock-jwt-token");
        mockMvc.perform(multipart("/user/register")
                .file(file)
                .param("email", "montassar@test.com")
                .param("password", "Password123!")
                .param("prenom", "Montassar")
                .param("nom", "Lounissi")
                .param("phoneNumber", "26111111")
                .param("title", "Ingenieur"))
                .andExpect(status().isOk());
    }

    @Test
    void testSignUp_InvalidEmail() throws Exception {
        mockMvc.perform(multipart("/user/register")
                .param("email", "invalid_email")
                .param("password", "Password123!")
                .param("prenom", "Montassar")
                .param("nom", "Lounissi")
                .param("phoneNumber", "26111111")
                .param("title", "Ingenieur"))
                .andExpect(status().isNotAcceptable());
    }

    @Test
    void testLogin_Success() throws Exception {
        LoginRequest loginRequest = new LoginRequest("montassar.lounissi@gmail.com", "Aaaaa?123456");
        User mockUser = new User();
        mockUser.setEmail("montassar.lounissi@gmail.com");
        mockUser.setPassword("$2a$10$o2rXJ0KRi38UTdzcNwX3iual.shztzjUX4NF/7agy2Hq4ZUE68mNi");
        mockUser.setTwoFactorAuth(false);
        when(userService.findByEmail("montassar.lounissi@gmail.com")).thenReturn(Optional.of(mockUser));
        when(userService.validatePassword("Aaaaa?123456", "$2a$10$o2rXJ0KRi38UTdzcNwX3iual.shztzjUX4NF/7agy2Hq4ZUE68mNi")).thenReturn(true);
        when(jwt.generateToken(any())).thenReturn("mock-jwt-token");
        mockMvc.perform(post("/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(loginRequest)))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.jwt").exists());    
    }
    

    @Test
    void testLogin_WrongPassword() throws Exception {
        LoginRequest loginRequest = new LoginRequest("montassar.lounissi@gmail.com", "WrongPassword!");
        User mockUser = new User();
        mockUser.setEmail("montassar.lounissi@gmail.com");
        mockUser.setPassword("$2a$10$o2rXJ0KRi38UTdzcNwX3iual.shztzjUX4NF/7agy2Hq4ZUE68mNi");
        when(userService.findByEmail("montassar.lounissi@gmail.com")).thenReturn(Optional.of(mockUser));
        when(userService.validatePassword("WrongPassword!", "$2a$10$o2rXJ0KRi38UTdzcNwX3iual.shztzjUX4NF/7agy2Hq4ZUE68mNi")).thenReturn(false);
        mockMvc.perform(post("/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }

}
