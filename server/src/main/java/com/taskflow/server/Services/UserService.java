package com.taskflow.server.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.taskflow.server.Entities.LoginRequest;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Repositories.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User addUser(User u) throws Exception
    {
        if ( userRepository.findByEmail(u.getEmail()) == null  && userRepository.findByUsername(u.getUsername()) == null )
            return userRepository.insert(u);
        else 
            throw new Exception("Username ou Email est déjà existe");
    }

       public User login(LoginRequest l){
        if(l.getEmail() != null){
            return userRepository.findByEmail(l.getEmail());
        } else {
            return userRepository.findByUsername(l.getUserName());
        } 
    }
    
}
