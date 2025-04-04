package com.taskflow.server.Repositories;

import com.taskflow.server.Entities.Notification;
import com.taskflow.server.Entities.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification,String> {
    public List<Notification> findAllByReceiver(User receiver);
}
