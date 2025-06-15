package com.taskflow.server.Services;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.taskflow.server.Entities.NecessaryRessource;
import com.taskflow.server.Repositories.NecessaryRessourcesRepository;
@Service
public class NecessaryRessourcesService {

    @Autowired
    private NecessaryRessourcesRepository necRessRepo;

    // Create
    public NecessaryRessource create(NecessaryRessource ressource) {
        return necRessRepo.save(ressource);
    }

    // Read all
    public List<NecessaryRessource> getAll() {
        return necRessRepo.findAll();
    }

    // Read by ID
    public NecessaryRessource getById(String id) {
        return necRessRepo.findById(id).orElse(null);
    }

    // Update
    public NecessaryRessource update(NecessaryRessource updatedRessource) {
        return necRessRepo.save(updatedRessource);
    }

    // Delete
    public void delete(NecessaryRessource nec) {
        necRessRepo.delete(nec);
    }
}