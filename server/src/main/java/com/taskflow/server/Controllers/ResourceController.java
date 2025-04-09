package com.taskflow.server.Controllers;

import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.*;
import com.taskflow.server.Services.ProjectService;
import com.taskflow.server.Services.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/resources")
public class ResourceController {
    @Autowired
    private ResourceService resourceService;
    @Autowired
    private ProjectService projectService;
    @Autowired
    private JWT MyJWT;
    @PostMapping("/create")
    public ResponseEntity<?> AddResource(@RequestHeader("Authorization") String token,
                                         @RequestBody Map<String, Object> requestBody){
        String userId = MyJWT.extractUserId(token);
        String projectId = (String) requestBody.get("projectId");
        Project project = projectService.getProjectById(projectId);
        if(!projectService.isCreator(userId,project)){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not allowed to create resources !!");
        }
        int resourceType = (Integer) requestBody.get("resourceType");
        String note = (String)requestBody.get("note");
        String resourceName = (String) requestBody.get("nom");
        String type = (String) requestBody.get("type");
        String statusString = (String) requestBody.get("status");
        Resource.Status status;
        switch(statusString){
            case "AVAILABLE":
                status = Resource.Status.AVAILABLE;
            case "ALLOCATED":
                status = Resource.Status.ALLOCATED;
            case "PENDING":
                status = Resource.Status.PENDING;
            case "UNAVAILABLE":
                status = Resource.Status.UNAVAILABLE;
            default:
                status = Resource.Status.AVAILABLE;
        }
        float coutUnitaire = (Float) requestBody.get("coutUnitaire");
        switch (resourceType){
            case 1:
                String unitMesure = (String) requestBody.get("UnitMesure");
                int qte = (Integer)requestBody.get("qte");
                TemporalResource temporalResource = new TemporalResource();
                temporalResource.setNom(resourceName);
                temporalResource.setType(type);
                temporalResource.setCoutUnitaire(coutUnitaire);
                temporalResource.setUnitMeasure(unitMesure);
                temporalResource.setQte(qte);
                temporalResource.setStatus(status);
                temporalResource.setNotes(note);
                TemporalResource saved = resourceService.createTemporalResource(temporalResource);
                Project result = projectService.addResource(project,saved);
                if(result==null){
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to add resource invalid project.");
                }
                if(saved !=null){
                    return ResponseEntity.status(200).body(saved);
                }else{
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to add resource check the inputs.");
                }

            case 2:
                String unit = (String) requestBody.get("UnitMesure");
                float consommationTotale = (Float)requestBody.get("consommationTotale");
                float consommationMax = (Float)requestBody.get("consommationMax");
                EnergeticResource energeticResource = new EnergeticResource();
                energeticResource.setNom(resourceName);
                energeticResource.setType(type);
                energeticResource.setCoutUnitaire(coutUnitaire);
                energeticResource.setStatus(status);
                energeticResource.setUnitMeasure(unit);
                energeticResource.setNotes(note);
                energeticResource.setConsommationTotale(consommationTotale);
                energeticResource.setConsommationMax(consommationMax);
                EnergeticResource energeticResource1 = resourceService.createEnergeticResource(energeticResource);
                Project result1 = projectService.addResource(project,energeticResource1);
                if(result1==null){
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to add resource invalid project.");
                }
                if(energeticResource1 !=null){
                    return ResponseEntity.status(200).body(energeticResource1);
                }else{
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to add resource check the inputs.");
                }

            case 3:
                qte =(Integer) requestBody.get("qte");
                int qteDisponibilite = (Integer)requestBody.get("qteDisponibilite");
                int utilisationTotale = (Integer)requestBody.get("utilisationTotale");
                MaterialResource materialResource = new MaterialResource();
                materialResource.setQte(qte);
                materialResource.setNom(resourceName);
                materialResource.setNotes(note);
                materialResource.setStatus(status);
                materialResource.setType(type);
                materialResource.setCoutUnitaire(coutUnitaire);
                materialResource.setQteDisponibilite(qteDisponibilite);
                materialResource.setUtilisationTotale(utilisationTotale);
                MaterialResource materialResource1 = resourceService.createMaterialResource(materialResource);
                Project result2 = projectService.addResource(project,materialResource1);
                if(result2==null){
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to add resource invalid project.");
                }
                if(materialResource1 !=null){
                    return ResponseEntity.status(200).body(materialResource1);
                }else{
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to add resource check the inputs.");
                }
            default:
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to add resource check the type.");
        }
    }
}
