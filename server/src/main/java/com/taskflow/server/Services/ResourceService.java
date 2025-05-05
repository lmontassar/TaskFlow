package com.taskflow.server.Services;

import com.taskflow.server.Entities.*;
import com.taskflow.server.Repositories.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {
    @Autowired
    private ResourceRepository resourceRepository;
    @Autowired
    public SimpMessagingTemplate messagingTemplate;
    public void sendSocket(Project project) {
        messagingTemplate.convertAndSend(
                "/topic/projects/" + project.getId(),
                project
        );
    }
    public TemporaryResource createTemporaryResource(TemporaryResource temporaryResource){
        return resourceRepository.save(temporaryResource);
    }

    public EnergeticResource createEnergeticResource(EnergeticResource energeticResource){
        return resourceRepository.save(energeticResource);
    }
    public MaterialResource createMaterialResource(MaterialResource materialResource){
        return resourceRepository.save(materialResource);
    }
    public Resource getById(String id){
        return resourceRepository.getById(id);
    }
    public void deleteById(String id) {
        resourceRepository.deleteById(id);
    }

    public Resource update(Resource res) {
        return resourceRepository.save(res);
    }
}
