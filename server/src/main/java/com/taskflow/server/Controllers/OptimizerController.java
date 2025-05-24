package com.taskflow.server.Controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.AffectationRessource;
import com.taskflow.server.Entities.ChangeTask;
import com.taskflow.server.Entities.EnergeticResource;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.Resource;
import com.taskflow.server.Entities.SaveChangesRequest;
import com.taskflow.server.Entities.Tache;
import com.taskflow.server.Entities.TemporaryResource;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Entities.DTO.CollaboratorDto;
import com.taskflow.server.Entities.DTO.ResourceDto;
import com.taskflow.server.Services.AIChatService;
import com.taskflow.server.Services.OptimiserService;
import com.taskflow.server.Services.ProjectService;
import com.taskflow.server.Services.ResourceService;
import com.taskflow.server.Services.TacheService;
import com.taskflow.server.Services.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/optimise")
@RequiredArgsConstructor
public class OptimizerController {
    @Autowired
    private OptimiserService optimiserService;

    @Autowired
    private TacheService tacheSer;

    @Autowired
    private UserService userService;

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private JWT myJWT;

    @PostMapping(value = "/")
    public ResponseEntity<?> streamChat(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> requestBody) throws InterruptedException, JsonProcessingException {
        try {
            String projectId = (String) requestBody.get("projectID");
            Boolean isCollab = Objects.equals((String) requestBody.get("optCollab"), "true");
            Boolean isResource = Objects.equals((String) requestBody.get("optResource"), "true");
            System.out.println(isCollab);
            System.out.println(isResource);
            ObjectNode optimizerRequest = optimiserService.optimise(projectId, isCollab, isResource);
            List<Map<String, Object>> opt = optimiserService.sendData(optimizerRequest, projectId);
            return ResponseEntity.ok(opt);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            System.out.println(e.getLocalizedMessage());
            return ResponseEntity.badRequest().build();
        }

    }

    @PostMapping("/save")
    public ResponseEntity<Void> saveChanges(
            @RequestHeader("Authorization") String token,
            @RequestBody SaveChangesRequest request) {
        try {

            List<ChangeTask> tasks = request.getResult();
            boolean isCollab = request.isOptCollab();
            boolean isResource = request.isOptResource();

            for (ChangeTask t : tasks) {
                Tache task = tacheSer.findTacheById(t.getId());
                task.setDateDebut((t.getNewData()).getStartDate());
                task.setDateFinEstime(t.getNewData().getEndDate());

                task.setRessources(new ArrayList<>());

                if (isCollab == true) {
                    List<User> assignUsers = new ArrayList<>();
                    for (CollaboratorDto ass : t.getNewData().getCollaborator()) {
                        User u = userService.findById(ass.getId());
                        if (u != null)
                            assignUsers.add(u);
                    }
                    task.setAssignee(assignUsers);
                }

                if (isResource == true) {
                    List<AffectationRessource> affRessList = new ArrayList<>();
                    for (ResourceDto r : t.getNewData().getResources()) {
                        Resource ressource = resourceService.getById(r.getId());
                        if (ressource != null) {
                            AffectationRessource aff = new AffectationRessource();
                            aff.setRess(ressource);
                            switch (ressource.getType()) {
                                case "Material": {
                                    aff.setQte(r.getQuantity());
                                    aff.setDateDebut(t.getNewData().getStartDate());
                                    aff.setDateFin(t.getNewData().getEndDate());
                                    
                                    break;
                                }
                                case "Energetic": {
                                    aff.setConsommation(r.getQuantity());
                                    EnergeticResource energetic = (EnergeticResource) ressource ;
                                    Float qte = (float) r.getQuantity();
                                    Float quantity = (float) t.getOldData()
                                                                .getResources().stream()
                                                                .filter(ress -> r.getId().equals(ress.getId()))
                                                                .map(ResourceDto::getQuantity)
                                                                .findFirst()
                                                                .orElse(0);
                                    Float quantityAdded = qte -  quantity;
                                    energetic.setConsommationTotale(energetic.getConsommationTotale() + quantityAdded );
                                    resourceService.update(energetic);
                                    break;
                                }

                                case "Temporary": {
                                    aff.setQte(r.getQuantity());
                                    TemporaryResource temporary = (TemporaryResource) ressource ;
                                    int qte = r.getQuantity();
                                    int quantity = t.getOldData()
                                                                .getResources().stream()
                                                                .filter(ress -> r.getId().equals(ress.getId()))
                                                                .map(ResourceDto::getQuantity)
                                                                .findFirst()
                                                                .orElse(0);
                                    int quantityAdded = qte -  quantity;
                                    temporary.setQte( temporary.getQte() - quantityAdded  );
                                    resourceService.update(temporary);
                                    break;
                                }
                            }
                            task.addRessource(aff);

                        }

                    }
                }

                tacheSer.update(task);
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
