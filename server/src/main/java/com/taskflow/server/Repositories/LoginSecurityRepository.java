package com.taskflow.server.Repositories;


import com.taskflow.server.Entities.LoginSecurity;
import com.taskflow.server.Entities.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LoginSecurityRepository extends MongoRepository<LoginSecurity,String> {
    Optional<LoginSecurity> findByEmail(String email);
}
