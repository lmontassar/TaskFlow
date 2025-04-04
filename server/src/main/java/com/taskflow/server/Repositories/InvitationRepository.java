package com.taskflow.server.Repositories;

import com.taskflow.server.Entities.Invitation;
import com.taskflow.server.Entities.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface InvitationRepository extends MongoRepository<Invitation,String> {
    public List<Invitation> findAllByReceiver(User receiver);
}
