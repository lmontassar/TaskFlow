package com.taskflow.server.Repositories;



import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.taskflow.server.Entities.User;

@Repository
public interface UserRepository extends MongoRepository<User,String> {
    User findByUsername(String username);
    User findByEmail(String email);
}
