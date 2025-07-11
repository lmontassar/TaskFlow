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
                                         @RequestBody Map<String, Object> requestBody) {

        String userId = MyJWT.extractUserId(token);
        String projectId = (String) requestBody.get("projectId");

        Project project = projectService.getProjectById(projectId);
        if (!projectService.isCreator(userId, project)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not allowed to create resources!");
        }

        String note = (String) requestBody.get("notes");
        String resourceName = (String) requestBody.get("nom");
        String type = (String) requestBody.get("type");
        String statusString = (String) requestBody.get("status");
        String categorie = (String) requestBody.get("categorie");

        // Parse status safely

        float coutUnitaire = ((Number) requestBody.get("coutUnitaire")).floatValue();

        switch (type) {
            case "Temporary": {
                String unitMesure = (String) requestBody.get("unitMeasure");
                int qte = ((Number) requestBody.get("qte")).intValue();

                TemporaryResource temporaryResource = new TemporaryResource();
                temporaryResource.setNom(resourceName);
                temporaryResource.setType(type);
                temporaryResource.setCategorie(categorie);
                temporaryResource.setCoutUnitaire(coutUnitaire);
                temporaryResource.setUnitMeasure(unitMesure);

                temporaryResource.setQte(qte);
                temporaryResource.setStatus(Resource.Status.AVAILABLE);
                temporaryResource.setNotes(note);

                TemporaryResource saved = resourceService.createTemporaryResource(temporaryResource);
                Project result = projectService.addResource(project, saved);
                resourceService.sendSocket(result);
                return (result != null && saved != null)
                        ? ResponseEntity.ok(saved)
                        : ResponseEntity.badRequest().body("Failed to add resource. Check inputs or project validity.");
            }

            case "Energetic": {
                String unit = (String) requestBody.get("unitMeasure");
                float consommationMax = ((Number) requestBody.get("consommationMax")).floatValue();
                int qte = ((Number) requestBody.get("qte")).intValue();

                EnergeticResource energeticResource = new EnergeticResource();
                energeticResource.setNom(resourceName);
                energeticResource.setType(type);
                energeticResource.setCategorie(categorie);
                energeticResource.setCoutUnitaire(coutUnitaire);
                energeticResource.setStatus(Resource.Status.AVAILABLE);
                energeticResource.setUnitMeasure(unit);
                energeticResource.setNotes(note);
                energeticResource.setConsommationTotale(0);
                energeticResource.setConsommationMax(consommationMax);

                EnergeticResource saved = resourceService.createEnergeticResource(energeticResource);
                Project result = projectService.addResource(project, saved);
                resourceService.sendSocket(result);
                return (result != null && saved != null)
                        ? ResponseEntity.ok(saved)
                        : ResponseEntity.badRequest().body("Failed to add resource. Check inputs or project validity.");
            }

            case "Material": {
                int qte = ((Number) requestBody.get("qte")).intValue();

                MaterialResource materialResource = new MaterialResource();
                materialResource.setQte(qte);
                materialResource.setNom(resourceName);
                materialResource.setNotes(note);
                materialResource.setCategorie(categorie);
                materialResource.setStatus(Resource.Status.AVAILABLE);
                materialResource.setType(type);
                materialResource.setCoutUnitaire(coutUnitaire);
                materialResource.setQteDisponibilite(qte);
                materialResource.setUtilisationTotale(0);

                MaterialResource saved = resourceService.createMaterialResource(materialResource);
                Project result = projectService.addResource(project, saved);
                resourceService.sendSocket(result);
                return (result != null && saved != null)
                        ? ResponseEntity.ok(saved)
                        : ResponseEntity.badRequest().body("Failed to add resource. Check inputs or project validity.");
            }

            default:
                return ResponseEntity.badRequest().body("Invalid resource type.");
        }
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<?> updateResource(@RequestHeader("Authorization") String token,
                                            @PathVariable String id,
                                            @RequestBody Map<String, Object> requestBody) {
        String userId = MyJWT.extractUserId(token);
        Resource existing = resourceService.getById(id);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resource not found.");
        }

        String projectId = (String) requestBody.get("projectId");

        Project project = projectService.getProjectById(projectId);
        if (project == null || !projectService.isCreator(userId, project)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not allowed to edit this resource!");
        }

        String note = (String) requestBody.get("notes");
        String resourceName = (String) requestBody.get("nom");
        String type = (String) requestBody.get("type");
        String statusString = (String) requestBody.get("status");
        String categorie = (String) requestBody.get("categorie");

        Resource.Status status;
        try {
            status = Resource.Status.valueOf(statusString.toUpperCase());
        } catch (Exception e) {
            status = Resource.Status.AVAILABLE;
        }

        float coutUnitaire = ((Number) requestBody.get("coutUnitaire")).floatValue();

        switch (type) {
            case "Temporary": {
                TemporaryResource res = (TemporaryResource) existing;
                res.setNom(resourceName);
                res.setNotes(note);
                res.setStatus(status);
                res.setCategorie(categorie);
                res.setCoutUnitaire(coutUnitaire);
                res.setQte(((Number) requestBody.get("qte")).intValue());
                res.setUnitMeasure((String) requestBody.get("unitMeasure"));
                TemporaryResource result = resourceService.createTemporaryResource(res);
                Project Updatedproject = projectService.getProjectById(projectId);
                resourceService.sendSocket(Updatedproject);

                return ResponseEntity.ok(result);
            }

            case "Energetic": {
                EnergeticResource res = (EnergeticResource) existing;
                res.setNom(resourceName);
                res.setNotes(note);
                res.setStatus(status);
                res.setCategorie(categorie);
                res.setCoutUnitaire(coutUnitaire);
                res.setUnitMeasure((String) requestBody.get("unitMeasure"));
                res.setConsommationTotale(((Number) requestBody.get("consommationTotale")).floatValue());
                res.setConsommationMax(((Number) requestBody.get("consommationMax")).floatValue());
                EnergeticResource result = resourceService.createEnergeticResource(res);
                Project Updatedproject2 = projectService.getProjectById(projectId);
                resourceService.sendSocket(Updatedproject2);
                return ResponseEntity.ok(result);
            }

            case "Material": {
                MaterialResource res = (MaterialResource) existing;
                res.setNom(resourceName);
                res.setNotes(note);
                res.setStatus(status);
                res.setCategorie(categorie);
                res.setCoutUnitaire(coutUnitaire);
                res.setQte(((Number) requestBody.get("qte")).intValue());
                res.setQteDisponibilite(((Number) requestBody.get("qteDisponibilite")).intValue());
                res.setUtilisationTotale(((Number) requestBody.get("utilisationTotale")).intValue());

                MaterialResource result = resourceService.createMaterialResource(res);
                Project Updatedproject3 = projectService.getProjectById(projectId);
                resourceService.sendSocket(Updatedproject3);
                return ResponseEntity.ok(result);
            }

            default:
                return ResponseEntity.badRequest().body("Invalid resource type.");
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteResource(@RequestHeader("Authorization") String token,
                                            @PathVariable String id,@RequestBody Map<String, Object> requestBody) {
        String userId = MyJWT.extractUserId(token);
        Resource resource = resourceService.getById(id);

        if (resource == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resource not found.");
        }
        String projectId = (String) requestBody.get("projectId");
        Project project = projectService.getProjectById(projectId);
        if (!projectService.isCreator(userId, project)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not allowed to create resources!");
        }

        try {
            projectService.removeResource(project, resource);
            resourceService.deleteById(id);
            Project Updated = projectService.getProjectById(projectId);
            resourceService.sendSocket(Updated);
            return ResponseEntity.ok("Resource deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete resource: " + e.getMessage());
        }
    }


}
