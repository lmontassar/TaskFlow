package com.taskflow.server.Controllers;

import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.AIChat;

import com.taskflow.server.Entities.User;
import com.taskflow.server.Services.AIChatService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

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
            @RequestBody Map<String, String> requestBody) throws InterruptedException {
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
    @PostMapping(value = "/generate-task-description")
    public ResponseEntity<?> generateTaskDescription(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> requestBody) throws InterruptedException {
        String desc = requestBody.get("description");
        String taskName = requestBody.get("taskName");
        String projectName = requestBody.get("projectName");
        String projectDescription = requestBody.get("projectDescription");
        String initialPrompt = "You are a project management AI assistant named TaskFlowAI. " +
                "You help users generate description for there tasks of the project using the task name and the description if exists . " +
                "If someone asks something unrelated, respond that your scope is limited to project management, respond professionally." +
                "Generate only the description no need to add title return only the description. ";
        String message = "Using the language of the task name, generate a short description from this task name : "+taskName+", " +
                "this is the project name :"+projectName+", and this is the project description : "+projectDescription +", if the project name and the description doesn't make sense don't care about them just generate the description.";
        String userId = myJWT.extractUserId(token);
        if(desc!=null && !desc.trim().isEmpty()){
            message+=" using this description: "+desc;
        }
        AIChat aiChat = new AIChat();
        aiChat.setTitle("GenDesc");
        User user = new User();
        user.setId(userId);
        aiChat.setUser(user);
        List<Map<String,Object>> messageList = new ArrayList<>();
        Map<String,Object> initialPromptRequest = new HashMap<>();
        Map<String,Object> requestMessage = new HashMap<>();
        initialPromptRequest.put("role","system");
        initialPromptRequest.put("content",initialPrompt);
        requestMessage.put("role","user");
        requestMessage.put("content",message);
        messageList.add(initialPromptRequest);
        messageList.add(requestMessage);
        aiChat.setMessageList(messageList);

        Map<String,Object> responseMessage = aiChatService.sendMessage(aiChat);
        if(responseMessage!=null){
            return ResponseEntity.status(200).body(responseMessage);
        }
        return ResponseEntity.status(400).build();

    }
    @PostMapping(value = "/generate-description")
    public ResponseEntity<?> generateDescription(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> requestBody) throws InterruptedException {
        String desc = requestBody.get("description");
        String projectName = requestBody.get("projectName");
        String initialPrompt = "You are a project management AI assistant named TaskFlowAI. " +
                "You help users generate description for there projects using the project name and the description if exists . " +
                "If someone asks something unrelated, respond that your scope is limited to project management, respond professionally." +
                "Generate only the description no need to add title return only the description. ";
        String message = "Using the language of the project name, generate a short description from this project name : "+projectName;
        String userId = myJWT.extractUserId(token);
        if(desc!=null && !desc.trim().isEmpty()){
            message+=" using this description: "+desc;
        }
        AIChat aiChat = new AIChat();
        aiChat.setTitle("GenDesc");
        User user = new User();
        user.setId(userId);
        aiChat.setUser(user);
        List<Map<String,Object>> messageList = new ArrayList<>();
        Map<String,Object> initialPromptRequest = new HashMap<>();
        Map<String,Object> requestMessage = new HashMap<>();
        initialPromptRequest.put("role","system");
        initialPromptRequest.put("content",initialPrompt);
        requestMessage.put("role","user");
        requestMessage.put("content",message);
        messageList.add(initialPromptRequest);
        messageList.add(requestMessage);
        aiChat.setMessageList(messageList);

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
