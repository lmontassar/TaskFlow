package com.taskflow.server.Controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.AIChat;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Services.AIChatService;
import com.taskflow.server.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.checkerframework.checker.units.qual.A;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.*;

@RestController
@RequestMapping("/ai-chat")
@RequiredArgsConstructor
public class AIChatController {
    @Autowired
    private AIChatService aiChatService;

    @Autowired
    private JWT myJWT;
    @PostMapping(value = "/stream")
    public ResponseEntity<?> streamChat(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> requestBody) {
        String message = requestBody.get("message");
        String aiChatId = requestBody.get("AIChatId");
        String projectID = requestBody.get("projectID");
        String userId = myJWT.extractUserId(token);

        if(projectID == null || projectID.isEmpty()){
            return ResponseEntity.status(413).build();
        }
        if(message == null || message.trim().isEmpty()){
            return ResponseEntity.status(413).build();
        }
        AIChat aiChat ;
        if(aiChatId ==null || aiChatId.isEmpty()){
            aiChat = aiChatService.initialiseConversation(projectID, userId);
        }else{
            aiChat = aiChatService.getById(aiChatId);
        }
        if (Objects.equals(aiChat.getTitle(), "New Conversation")) {
            String trimmedMessage = message.trim();
            int spaceIndex = trimmedMessage.indexOf(" ");

            if (spaceIndex != -1) {
                aiChat.setTitle(trimmedMessage.substring(0, spaceIndex));
            } else {
                aiChat.setTitle(trimmedMessage);
            }
        }
        Map<String,Object> requestMessage = new HashMap<>();
        String cleanMessage = aiChatService.cleanMessage(message,aiChat);
        requestMessage.put("role","user");
        requestMessage.put("content",cleanMessage);
        aiChat.getMessageList().add(requestMessage);
        Map<String,Object> responseMessage = aiChatService.sendMessage(aiChat);
        if(responseMessage!=null){
            return ResponseEntity.status(200).body(responseMessage);
        }
        return ResponseEntity.status(400).build();

    }

    @GetMapping(value = "/getChats/{projectID}")
    public ResponseEntity<?> getChats(
            @RequestHeader("Authorization") String token,
            @PathVariable String projectID){
        String userId = myJWT.extractUserId(token);
        if(projectID == null || projectID.isEmpty()){
            return ResponseEntity.status(413).build();
        }
        List<AIChat> aiChats = aiChatService.getByProjectAndUser(projectID,userId);
        if(aiChats ==null || aiChats.isEmpty()) {
            AIChat aiChat = aiChatService.initialiseConversation(projectID, userId);
            assert aiChats != null;
            aiChats.add(aiChat);
        }
        return ResponseEntity.status(200).body(aiChats);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteChat(
            @RequestHeader("Authorization") String token,
            @PathVariable String id){
        if(aiChatService.deleteChat(id)){
            return ResponseEntity.status(200).build();
        }
        return ResponseEntity.status(404).build();
    }

}
