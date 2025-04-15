package com.taskflow.server.Services;

import com.taskflow.server.Entities.*;
import com.taskflow.server.Repositories.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {
    @Autowired
    private ResourceRepository resourceRepository;
    public TemporalResource createTemporalResource(TemporalResource temporalResource){
        return resourceRepository.save(temporalResource);
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
}
