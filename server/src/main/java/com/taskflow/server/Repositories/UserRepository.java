package com.taskflow.server.Repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;

import com.taskflow.server.Entities.User;

import java.util.Optional;

import javax.transaction.Transactional;

@Repository
public interface UserRepository extends MongoRepository<User,String> {
    // Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phonenumber);
    public User getUserById(String id);


    
    @Query("{ '_id': ?0 }")
    @Update("{ '$set': { 'activation': ?1 } }")
    public void updateActivationById(String id, boolean isActive);



    @Query("{ '_id': ?0 }")
    @Update("{ '$set': { 'password': ?1 } }")
    public void updatePasswordById(String id, String password);
}
