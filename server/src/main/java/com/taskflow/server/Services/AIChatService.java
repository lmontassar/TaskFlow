package com.taskflow.server.Services;

import com.taskflow.server.Entities.AIChat;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Repositories.AIChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIChatService {
    @Autowired
    private UserService userService;
    @Autowired
    private ProjectService projectService;
    @Value("${groq.api.key}")
    private String apiKey;
    @Autowired
    private TacheService tacheService;
    @Autowired
    private AIChatRepository aiChatRepository;

    private String baseUrl="https://api.groq.com/openai/v1/chat/completions";
    public Map<String,Object> sendMessage(AIChat aiChat){

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setBearerAuth(apiKey);
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);

        Map<String,Object> request = new HashMap<>();
        request.put("model",aiChat.getModel());
        request.put("messages",aiChat.getMessageList());
        HttpEntity<Map<String,Object>> entity = new HttpEntity<>(request,httpHeaders);
        try{
            ResponseEntity<Map> response = restTemplate.exchange(baseUrl, HttpMethod.POST,entity,Map.class);
            Map<String,Object> responseBody = response.getBody();
            if(responseBody!=null && responseBody.containsKey("choices")){
                List<Map<String,Object>> choices =(List<Map<String,Object>>) responseBody.get("choices");
                if(!choices.isEmpty() && choices.get(0).containsKey("message")){
                    Map<String,Object> responseMessage = (Map<String,Object>) choices.get(0).get("message");
                    aiChat.getMessageList().add(responseMessage);
                    saveChat(aiChat);
                    return responseMessage;
                }
            }
            return null;
        }catch(HttpClientErrorException e){
            return null;
        }catch (Exception e){
            System.out.println(e);
            return null;
        }
    }
    public AIChat saveChat(AIChat aiChat){
        return aiChatRepository.save(aiChat);
    }

    public AIChat initialiseConversation(String projectId,String userId)
    {
        Project project = projectService.getProjectById(projectId);
        User user = userService.findById(userId);
        AIChat aiChat = new AIChat();
        aiChat.setProject(project);
        aiChat.setUser(user);
        Map<String,Object> params = new HashMap<>();
        params.put("role","user");
        String tasks = tacheService.findTacheByProjectId(aiChat.getProject()).toString();
        params.put("content","You are a project management AI assistant named TaskFlowAI. You help users manage projects by creating projects, adding and assigning tasks, tracking progress, and generating reports. If someone asks something unrelated, respond that your scope is limited to project management. this is the project you will help the user for "+project.toString()+" and these are the tasks of the project :"+ tasks+" .");
        aiChat.getMessageList().add(params);
        Map<String,Object> params2 = new HashMap<>();
        params2.put("role","system");
        params2.put("content","ok");
        aiChat.getMessageList().add(params2);
        return aiChatRepository.save(aiChat);
    }
    public String cleanMessage(String message, AIChat aiChat) {
        String clean = message.replace("/project", aiChat.getProject().toString());
        clean = clean.replace("/tasks",tacheService.findTacheByProjectId(aiChat.getProject()).toString());
        System.out.println(clean);
        return clean;
    }
    public Boolean deleteChat(String id) {
        boolean exists = aiChatRepository.existsById(id);
        if (exists) {
            aiChatRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }


    public AIChat getById(String id){
        return aiChatRepository.getById(id);
    }

    public List<AIChat> getByProjectAndUser(String id, String userId) {
        List<AIChat> aiChats = aiChatRepository.getAllByProjectAndUser(id, userId);

        for (AIChat aiChat : aiChats) {
            List<Map<String, Object>> messageList = aiChat.getMessageList();

            // Remove the first two messages, if present
            if (messageList.size() > 2) {
                messageList = messageList.subList(2, messageList.size());
                aiChat.setMessageList(messageList);  // Update the messageList after modification
            } else {
                aiChat.setMessageList(new ArrayList<>());  // Clear the list if it has fewer than 2 messages
            }

            // Process messages in the remaining list
            for (Map<String, Object> message : messageList) {
                Object roleObj = message.get("role");
                if (roleObj instanceof String && ((String) roleObj).equals("user")) {
                    String msg = (String) message.get("content");
                    String newMsg = msg.replace(aiChat.getProject().toString(), "/project");
                    message.put("content", newMsg);
                }
            }
        }

        return aiChats;
    }


}
