package com.taskflow.server.Services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.taskflow.server.Entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.text.SimpleDateFormat;
import java.time.Duration;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class OptimiserService {
    @Autowired
    private TacheService tacheService;
    @Autowired
    private UserService userService;
    @Autowired 
    private ResourceService resourceService;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private ProjectService projectService;
    @Autowired
    private AIChatService aiChatService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    public ArrayNode getDescription(ObjectNode data) throws InterruptedException, JsonProcessingException {
        AIChat aiChat = new AIChat();
        List<Map<String, Object>> messageList = new ArrayList<>();
        System.out.println(data);
        String init = "You are a project management AI assistant named TaskFlowAI. You help users add the required skills of the task in the description . depending on the json object i will provide take the description list and foreach description add the required skills depending on the collaborator list (the role and the competances) and return the updated description list. please dont add title and dont write your thoughts .Respond only with the updated description including the old description provided plus ' Required Skills: ...' section if there is no skills that match the desciprion in the descriptionList then add the old description plus ' Required Skills : .' . please dont add title and dont write your thoughts just return the updated description.Please return only a list of the updated descriptions,return the result in JSON format don't add title or you thoughts.return in this format [\"updated description\"].";

        /*
         * "You are a project management AI assistant named TaskFlowAI. " +
         * "You help users add the required skills of the task in the description depending on the collaborators list provided. "
         * +
         * "Only include skills from the collaborators' roles and competences. " +
         * "please dont add title and dont write your thoughts ."+
         * "Respond only with the updated description including the old description provided plus ' Required Skills: ...' section. "
         * +
         * "please dont add title and dont write your thoughts just return the updated description."
         * +
         * "if there is no match between the collaborators roles and competances add just ' Required Skills: '."
         * +
         * "Collaborators list: " + collabs.toString();
         */

        messageList.add(Map.of("role", "user", "content", init));
        messageList.add(Map.of("role", "assistant", "content", "ok"));
        messageList.add(Map.of("role", "user", "content", data.toString()));

        aiChat.setMessageList(messageList);

        Map<String, Object> responseMessage = aiChatService.sendMessage(aiChat);
        while (responseMessage == null) {

            responseMessage = aiChatService.sendMessage(aiChat);
        }
        System.out.println(responseMessage);
        String output = (String) responseMessage.get("content");
        JsonNode node = objectMapper.readTree(output);
        if (node.isArray()) {
            ArrayNode arrayNode = (ArrayNode) node;
            return arrayNode;
        } else {
            System.out.println("Input is not a valid JSON array");
            return null;
        }

    }

    public String getNecessaryName(String name, ArrayNode resources) throws InterruptedException {
        AIChat aiChat = new AIChat();
        List<Map<String, Object>> messageList = new ArrayList<>();

        String init = "You are a project management AI assistant named TaskFlowAI. " +
                "Given a resource name, find a matching name from the provided resources list. " +
                "Return only the matching resource name or 'none' if not found. please dont add title and dont write your thoughts just return the name ."
                +
                "Resources list: " + resources.toString();

        messageList.add(Map.of("role", "user", "content", init));
        messageList.add(Map.of("role", "assistant", "content", "ok"));
        messageList.add(Map.of("role", "user", "content", name));

        aiChat.setMessageList(messageList);

        Map<String, Object> responseMessage = aiChatService.sendMessage(aiChat);
        while (responseMessage == null) {

            responseMessage = aiChatService.sendMessage(aiChat);
        }
        System.out.println((String) responseMessage.get("content"));
        return (String) responseMessage.get("content");
    }
    public ArrayNode getNecessaryNames(List<NecessaryRessource> necessaryRessources, ArrayNode resources) throws InterruptedException, JsonProcessingException {
        AIChat aiChat = new AIChat();
        List<Map<String, Object>> messageList = new ArrayList<>();
        ArrayNode necessaryList = objectMapper.createArrayNode();
        for (NecessaryRessource nr:necessaryRessources){
            ObjectNode n = objectMapper.createObjectNode();
            n.put("name",nr.getName());
            n.put("category",nr.getCategorie());
            n.put("type",nr.getType().toString());

            necessaryList.add(n);
        }
        String init = "You are a project management AI assistant named TaskFlowAI. Given a list of resources (name, type and category). For each resource name find a matching name from the provided resources list, if the name does not match put 'none' in the list. please dont add title and dont write your thoughts just return list of the names . this is the Resources list: " + resources.toString();

        /*
        *"You are a project management AI assistant named TaskFlowAI.
        * You help users add the required skills of the task in the description .
        * depending on the json object
        * i will provide take the description list and foreach description
        * add the required skills depending on the collaborator list (the role and the competances)
        * and return the updated description list.
        * please dont add title and dont write your thoughts .
        * Respond only with the updated description including the old description provided plus ' Required Skills: ...' section if there is no skills that match the desciprion in the descriptionList then add the old description plus ' Required Skills : .' . please dont add title and dont write your thoughts just return the updated description.Please return only a list of the updated descriptions,return the result in JSON format don't add title or you thoughts.return in this format [\"updated description\"].";

         *
        * */

        messageList.add(Map.of("role", "user", "content", init));
        messageList.add(Map.of("role", "assistant", "content", "ok"));
        messageList.add(Map.of("role", "user", "content", necessaryList.toString()));

        aiChat.setMessageList(messageList);

        Map<String, Object> responseMessage = aiChatService.sendMessage(aiChat);
        while (responseMessage == null) {

            responseMessage = aiChatService.sendMessage(aiChat);
        }
        System.out.println((String) responseMessage.get("content"));
        String output = (String) responseMessage.get("content");
        JsonNode node = objectMapper.readTree(output);
        if (node.isArray()) {
            ArrayNode arrayNode = (ArrayNode) node;
            return arrayNode;
        } else {
            System.out.println("Input is not a valid JSON array");
            return null;
        }
    }
    public ArrayNode cleanNecessaryResources(List<NecessaryRessource> necessaryRessources, ArrayNode resources) throws InterruptedException, JsonProcessingException {
        ArrayNode cleaned = objectMapper.createArrayNode();
        ArrayNode necessaryNames = getNecessaryNames(necessaryRessources,resources);
        System.out.println("dzadzadazd : "+necessaryNames);
        int index = 0;
        for (NecessaryRessource resource : necessaryRessources) {
            String name =necessaryNames.get(index).asText();
            if (!Objects.equals(name, "none")) {
                ObjectNode nr = objectMapper.createObjectNode();
                nr.put("name", name);
                nr.put("type", String.valueOf(resource.getType()));
                nr.put("category", resource.getCategorie());
                nr.put("qte", (int) resource.getQte());
                cleaned.add(nr);
            }
            index++;
        }
        return cleaned;
    }

    public Boolean isExist(ArrayNode deps, Tache task1, Tache task2, String type) {
        for (JsonNode dep : deps) {
            if (dep.get("type").asText().equals(type)
                    && (dep.get("taskID2").asText().equals(task2.getId())
                            && dep.get("taskID1").asText().equals(task1.getId()))
                    || (dep.get("taskID1").asText().equals(task2.getId())
                            && dep.get("taskID2").asText().equals(task1.getId()))) {
                return true;
            }
        }
        return false;
    }

    public ArrayNode cleanDependencies(List<Tache> tasks) {
        ArrayNode dependenciesNode = objectMapper.createArrayNode();
        for (Tache task : tasks) {
            if (task.getParent() != null) {
                ObjectNode sub = objectMapper.createObjectNode();
                sub.put("type", "SUB");
                sub.put("taskID1", task.getParent().getId());
                sub.put("taskID2", task.getId());
                dependenciesNode.add(sub);
            }
            for (Tache pres : task.getPrecedentes()) {
                if (!isExist(dependenciesNode, task, pres, "FS")) {
                    ObjectNode ff = objectMapper.createObjectNode();
                    ff.put("type", "FS");
                    ff.put("taskID1", pres.getId());
                    ff.put("taskID2", task.getId());
                    dependenciesNode.add(ff);
                }
            }
            for (Tache paral : task.getParalleles()) {
                if (!isExist(dependenciesNode, task, paral, "SS")) {
                    ObjectNode ss = objectMapper.createObjectNode();
                    ss.put("type", "SS");
                    ss.put("taskID1", task.getId());
                    ss.put("taskID2", paral.getId());
                    dependenciesNode.add(ss);
                }
            }
        }
        return dependenciesNode;
    }
    public ArrayNode cleanTasks(List<Tache> tasks, ArrayNode collabs, ArrayNode resources, Boolean isResource) throws InterruptedException, JsonProcessingException {
        ArrayNode taskNode = objectMapper.createArrayNode();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
        ObjectNode descriptionCleanData = objectMapper.createObjectNode();
        ArrayNode descList = objectMapper.createArrayNode();
        for (Tache task : tasks) {
            descList.add(task.getDescription());
        }
        descriptionCleanData.set("descriptionList", descList);
        descriptionCleanData.set("collaboratorList", collabs);
        ArrayNode descriptionList = getDescription(descriptionCleanData);
        int index = 0;
        for (Tache task : tasks) {
            ArrayNode cleaned = objectMapper.createArrayNode();
            String formattedDate = sdf.format(new Date());
            String dateDebut = task.getDateDebut() == null
                    ? formattedDate
                    : task.getDateDebut().atZone(ZoneOffset.UTC).format(formatter);
            String datefin = task.getDateFinEstime() == null
                    ? formattedDate
                    : task.getDateFinEstime().atZone(ZoneOffset.UTC).format(formatter);

            Duration duree = Duration.between(
                    task.getDateDebut() != null ? task.getDateDebut() : task.getDateFinEstime(),
                    task.getDateFinEstime() != null ? task.getDateFinEstime() : task.getDateDebut());

            ObjectNode t = objectMapper.createObjectNode();
            t.put("id", task.getId());
            t.put("nomTache", task.getNomTache());
            t.put("description", descriptionList.get(index));
            t.put("budgetEstime", task.getBudgetEstime());
            t.put("dateDebut", dateDebut);
            t.put("dateFinEstime", datefin);
            t.put("duree", duree.toSeconds());
            if(isResource){
                cleaned = cleanNecessaryResources(task.getNecessaryRessource(), resources);
                for (AffectationRessource r :
                        task.getRessources()) {
                    if(r.getRess() instanceof MaterialResource){
                        ObjectNode resNode = objectMapper.createObjectNode();
                        resNode.put("name",r.getRess().getNom());
                        resNode.put("type",r.getRess().getType());
                        resNode.put("category",r.getRess().getCategorie());
                        resNode.put("qte", (int) ((MaterialResource) r.getRess()).getQte());
                        cleaned.add(resNode);
                    }

                }
            }
            t.set("ressourcesNecessaires", cleaned);
            taskNode.add(t);
            index++;
        }
        return taskNode;
    }

    public ArrayNode cleanResource(List<Resource> resources) {
        ArrayNode resourcesNode = objectMapper.createArrayNode();
        for (Resource resource : resources) {
            ObjectNode res = objectMapper.createObjectNode();
            res.put("id", resource.getId());
            res.put("nom", resource.getNom());
            res.put("type", resource.getType());
            res.put("coutUnitaire", resource.getCoutUnitaire());

            if (resource instanceof TemporaryResource) {
                res.put("qte", (int) ((TemporaryResource) resource).getQte());
            } else if (resource instanceof EnergeticResource) {
                EnergeticResource er = (EnergeticResource) resource;
                res.put("qte", (int) (er.getConsommationMax() - er.getConsommationTotale()));
            } else if (resource instanceof MaterialResource) {
                res.put("qte", (int) ((MaterialResource) resource).getQte());
            }

            resourcesNode.add(res);
        }
        return resourcesNode;
    }

    public ArrayNode cleanCollaborateur(Set<Collaborator> collabs) {
        ArrayNode newCollabs = objectMapper.createArrayNode();
        for (Collaborator collab : collabs) {
            ObjectNode coll = objectMapper.createObjectNode();
            coll.put("id", collab.getUser().getId());
            coll.put("title", collab.getUser().getTitle());
            coll.put("role", collab.getRole());

            ArrayNode competencesArray = objectMapper.createArrayNode();
            for (Competance competence : collab.getCompetances()) {
                ObjectNode compNode = objectMapper.createObjectNode();
                compNode.put("titre", competence.getTitre());
                compNode.put("niveau", competence.getNiveau());
                competencesArray.add(compNode);
            }

            coll.set("competences", competencesArray);
            newCollabs.add(coll); // <-- This was missing in your code
        }
        return newCollabs;
    }

    public ObjectNode optimise(String projectId,Boolean isCollab,Boolean isResource) throws InterruptedException, JsonProcessingException {
        messagingTemplate.convertAndSend(
                "/topic/optimiseSteps/" + projectId,
                1
        );
        ObjectNode optimiseRequest = objectMapper.createObjectNode();
        Project project = projectService.getProjectById(projectId);
        List<Tache> taches = projectService.tacheService.findTacheByProjectId(project);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");

        ObjectNode projectNode = objectMapper.createObjectNode();
        projectNode.put("dateDebut", sdf.format(project.getDateDebut()));
        projectNode.put("dateFin", sdf.format(project.getDateFinEstime()));
        optimiseRequest.set("projet", projectNode);
        ArrayNode collabsNode = objectMapper.createArrayNode();

        ArrayNode resourcesNode = cleanResource(project.getListeRessource());
        if(isCollab){
            collabsNode = cleanCollaborateur(project.getListeCollaborateur());
        }

        ArrayNode tasksNode = cleanTasks(taches, collabsNode, resourcesNode,isResource);
        messagingTemplate.convertAndSend(
                "/topic/optimiseSteps/" + projectId,
                2
        );

        ArrayNode dependenciesNode = cleanDependencies(taches);
        optimiseRequest.set("collaborateur", collabsNode);
        optimiseRequest.set("ressources", resourcesNode);
        optimiseRequest.set("tasks", tasksNode);
        optimiseRequest.set("dependencies", dependenciesNode);
        messagingTemplate.convertAndSend(
                "/topic/optimiseSteps/" + projectId,
                3
        );
        return optimiseRequest;
    }

    public List<Map<String, Object>> sendData(ObjectNode data,String projectId) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        messagingTemplate.convertAndSend(
                "/topic/optimiseSteps/" + projectId,
                4
        );
        try {
            // Convert ObjectNode to JSON string
            String json = objectMapper.writeValueAsString(data);
            // Prepare HTTP request
            HttpEntity<String> entity = new HttpEntity<>(json, headers);
            // Send POST request
            ResponseEntity<Map> response = restTemplate.exchange(
                    "http://localhost:8000/schedule",
                    HttpMethod.POST,
                    entity,
                    Map.class);
            // Convert response Map to ObjectNode
            Map<String, Object> responseMap = response.getBody();
            if (responseMap == null) {
            return null;// objectMapper.createObjectNode().put("error", "Empty response from external service");
            }
            List<Map<String, Object>> transformedList = preapareResponse(responseMap);
            messagingTemplate.convertAndSend(
                    "/topic/optimiseSteps/" + projectId,
                    5
            );
            return transformedList;
        } catch (HttpClientErrorException e) {
            System.err.println("HTTP Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            return null;
        }
    }
    public List<Map<String, Object>> preapareResponse(Map<String, Object> responseMap) {
        List<Map<String, Object>> transformedList = new ArrayList<>();
        Map<String, Object> scheduleMap = (Map<String, Object>) responseMap.get("schedule");
        for (Map.Entry<String, Object> entry : scheduleMap.entrySet()) {
            String taskId = entry.getKey();
            Map<String, Object> taskData = (Map<String, Object>) entry.getValue();
            Map<String, Object> transformed = new HashMap<>();
            Map<String, Object> oldData = new HashMap<>();
            Map<String, Object> newData = new HashMap<>();
            Tache t = tacheService.findTacheById(taskId);
            
            transformed.put("id", taskId);
            transformed.put("name", t.getNomTache() );
            oldData.put("id", taskId);
            oldData.put("name", t.getNomTache() );
            newData.put("id", taskId);
            newData.put("name", t.getNomTache() );

            User u = userService.findById((String) taskData.get("collaborator"));
            List<Map<String,Object>> newColabs = new ArrayList<>();
            if( u != null){
                Map<String, Object> newcolab = new HashMap<>();
                newcolab.put("id", u.getId());
                newcolab.put("name", u.getPrenom() + " " + u.getNom());
                newColabs.add(newcolab);
            }
            newData.put("collaborator",newColabs);

            //newData.put("collaborator", ( u != null) ? u.getPrenom() + " " + u.getNom() : (String) taskData.get("collaborator")  );
            

            List<Map<String, Object>> resourcesList = new ArrayList<>();
            List<Map<String, Object>> oldResourcesList = new ArrayList<>();
            List<Map<String, Object>> resources = (List<Map<String, Object>>) taskData.get("resources");
            for (Map<String, Object> res : resources) {
                Map<String, Object> resMap = new HashMap<>();
                Resource r = resourceService.getById((String) res.get("id"));
                resMap.put("id",r.getId());
                resMap.put("name", r.getNom());
                resMap.put("quantity", res.get("allocated")); // or "requested" if preferred
                resourcesList.add(resMap);
            }
            for (AffectationRessource r : t.getRessources()) {
                boolean found = false;
                for (Map<String, Object> resMap : resourcesList) {
                    if (resMap.get("id").equals(r.getRess().getId())) {
                        int currentQty = Integer.parseInt(resMap.get("quantity").toString());

                        if((r.getRess().getType()).equals("Material")){
                            resMap.put("quantity",  ((r.getRess().getType()).equals("Energetic")?r.getConsommation():r.getQte()));
                        }
                        else{
                            resMap.put("quantity", currentQty +  ((r.getRess().getType()).equals("Energetic")?r.getConsommation():r.getQte()));
                        }
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    Map<String, Object> newMap = new HashMap<>();
                    Resource res = resourceService.getById(r.getRess().getId());
                    newMap.put("id", res.getId());
                    newMap.put("name", res.getNom());
                    newMap.put("quantity", (res.getType().equals("Energetic") ? r.getConsommation() : r.getQte()));
                    resourcesList.add(newMap);
                }
                Map<String, Object> newMap = new HashMap<>();
                Resource res = resourceService.getById(r.getRess().getId());
                newMap.put("id", res.getId());
                newMap.put("name", res.getNom());
                newMap.put("quantity", (res.getType().equals("Energetic") ? r.getConsommation() : r.getQte()));
                oldResourcesList.add(newMap);
            }
            newData.put("resources", resourcesList);
            newData.put("startDate", taskData.get("start"));
            newData.put("endDate", taskData.get("end"));
            
            List<Map<String,Object>> oldColabs = new ArrayList<>();
            for(User ass: t.getAssignee()) {
                Map<String, Object> newMap = new HashMap<>();
                newMap.put("id", ass.getId());
                newMap.put("name", ass.getPrenom() + " " + ass.getNom());
                oldColabs.add(newMap);
            }
            oldData.put("collaborator",oldColabs);
            oldData.put("resources", oldResourcesList );
            oldData.put("startDate", t.getDateDebut() );
            oldData.put("endDate", t.getDateFinEstime() );
            transformed.put("newData", newData);
            transformed.put("oldData", oldData);
            transformed.put("hasChanges",true);
            transformedList.add(transformed);
        }
        return transformedList; 
    }
}
