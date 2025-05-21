package com.taskflow.server.Services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.taskflow.server.Entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.time.Duration;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class OptimiserService {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private ProjectService projectService;
    @Autowired
    private AIChatService aiChatService;
    public ArrayNode getDescription(ObjectNode data) throws InterruptedException, JsonProcessingException {
        AIChat aiChat = new AIChat();
        List<Map<String, Object>> messageList = new ArrayList<>();
        System.out.println(data);
        String init = "You are a project management AI assistant named TaskFlowAI. You help users add the required skills of the task in the description . depending on the json object i will provide take the description list and foreach description add the required skills depending on the collaborator list (the role and the competances) and return the updated description list. please dont add title and dont write your thoughts .Respond only with the updated description including the old description provided plus ' Required Skills: ...' section if there is no skills that match the desciprion in the descriptionList then add the old description plus ' Required Skills : .' . please dont add title and dont write your thoughts just return the updated description.Please return only a list of the updated descriptions,return the result in JSON format don't add title or you thoughts.return in this format [\"updated description\"].";


                /*"You are a project management AI assistant named TaskFlowAI. " +
                "You help users add the required skills of the task in the description depending on the collaborators list provided. " +
                "Only include skills from the collaborators' roles and competences. " +
                "please dont add title and dont write your thoughts ."+
                "Respond only with the updated description including the old description provided plus ' Required Skills: ...' section. " +
                "please dont add title and dont write your thoughts just return the updated description."+
                "if there is no match between the collaborators roles and competances add just ' Required Skills: '."+
                "Collaborators list: " + collabs.toString();*/

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
                "Return only the matching resource name or 'none' if not found. please dont add title and dont write your thoughts just return the name ." +
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

    public ArrayNode cleanNecessaryResources(List<NecessaryRessource> necessaryRessources, ArrayNode resources) throws InterruptedException {
        ArrayNode cleaned = objectMapper.createArrayNode();
        for (NecessaryRessource resource : necessaryRessources) {
            String name = getNecessaryName(resource.getName(), resources);
            if (!Objects.equals(name, "none")) {
                ObjectNode nr = objectMapper.createObjectNode();
                nr.put("name", name);
                nr.put("type", String.valueOf(resource.getType()));
                nr.put("category", resource.getCategorie());
                nr.put("qte", (int) resource.getQte());
                cleaned.add(nr);
            }
        }
        return cleaned;
    }

    public Boolean isExist(ArrayNode deps, Tache task1, Tache task2, String type) {
        for (JsonNode dep : deps) {
            if (dep.get("type").asText().equals(type)
                    && (dep.get("taskID2").asText().equals(task2.getId())
                    && dep.get("taskID1").asText().equals(task1.getId()))||(dep.get("taskID1").asText().equals(task2.getId())
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
    public ArrayNode cleanTasks(List<Tache> tasks, ArrayNode collabs, ArrayNode resources) throws InterruptedException, JsonProcessingException {
        ArrayNode taskNode = objectMapper.createArrayNode();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
        ObjectNode descriptionCleanData = objectMapper.createObjectNode();
        ArrayNode descList = objectMapper.createArrayNode();
        for (Tache task:tasks) {
            descList.add(task.getDescription());
        }
        descriptionCleanData.set("descriptionList",descList);
        descriptionCleanData.set("collaboratorList",collabs);
        ArrayNode descriptionList = getDescription(descriptionCleanData);
        int index = 0;
        for (Tache task : tasks) {

            String formattedDate = sdf.format(new Date());
            String dateDebut = task.getDateDebut() == null
                    ? formattedDate
                    : task.getDateDebut().atZone(ZoneOffset.UTC).format(formatter);
            String datefin = task.getDateFinEstime() == null
                    ? formattedDate
                    : task.getDateFinEstime().atZone(ZoneOffset.UTC).format(formatter);

            Duration duree = Duration.between(task.getDateDebut() != null ? task.getDateDebut() : task.getDateFinEstime(),
                    task.getDateFinEstime() != null ? task.getDateFinEstime() : task.getDateDebut());

            ObjectNode t = objectMapper.createObjectNode();
            t.put("id", task.getId());
            t.put("nomTache", task.getNomTache());
            t.put("description", descriptionList.get(index));
            t.put("budgetEstime", task.getBudgetEstime());
            t.put("dateDebut", dateDebut);
            t.put("dateFinEstime", datefin);
            t.put("duree", duree.toSeconds());
            ArrayNode cleaned = cleanNecessaryResources(task.getNecessaryRessource(), resources);
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
            newCollabs.add(coll);  // <-- This was missing in your code
        }
        return newCollabs;
    }

    public ObjectNode optimise(String projectId) throws InterruptedException, JsonProcessingException {
        ObjectNode optimiseRequest = objectMapper.createObjectNode();
        Project project = projectService.getProjectById(projectId);
        List<Tache> taches = projectService.tacheService.findTacheByProjectId(project);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");

        ObjectNode projectNode = objectMapper.createObjectNode();
        projectNode.put("dateDebut", sdf.format(project.getDateDebut()));
        projectNode.put("dateFin", sdf.format(project.getDateFinEstime()));
        optimiseRequest.set("projet", projectNode);

        ArrayNode resourcesNode = cleanResource(project.getListeRessource());
        ArrayNode collabsNode = cleanCollaborateur(project.getListeCollaborateur());
        ArrayNode tasksNode = cleanTasks(taches, collabsNode, resourcesNode);
        ArrayNode dependenciesNode = cleanDependencies(taches);

        optimiseRequest.set("collaborateur", collabsNode);
        optimiseRequest.set("ressources", resourcesNode);
        optimiseRequest.set("tasks", tasksNode);
        optimiseRequest.set("dependencies", dependenciesNode);
        return optimiseRequest;
    }
}
