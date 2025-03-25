package com.taskflow.server.Services;

import com.taskflow.server.Entities.Collaborator;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Repositories.UserRepository;

import io.micrometer.common.util.StringUtils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;


@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    public User findOrCreateUser(User u) {
        User existingUser = userRepository.findByEmail(u.getEmail()).orElse(null);
        if (existingUser != null) {
            return existingUser;
        } else {
            u.setActivation(Boolean.TRUE);
            return userRepository.save(u);
        }
    }
    public User createUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return null;
        }

        

        if( !user.getPhoneNumber().equals("") )
            if ( userRepository.findByPhoneNumber(user.getPhoneNumber()).isPresent()) {
                return null;
            }
            
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }




    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateById(String id,User upUser){
        User u = userRepository.findById(id).orElse(null);
        if (u == null) return null;
        BeanUtils.copyProperties(upUser, u , getNullPropertyNames(upUser) );
        return userRepository.save(u);
    }


    public void resetPassword(User u,String password){
        password = passwordEncoder.encode(password);
        userRepository.updatePasswordById(u.getId(), password);
    }

    private String[] getNullPropertyNames(Object source) {
        return Arrays.stream(BeanUtils.getPropertyDescriptors(source.getClass()))
                .map(pd -> pd.getName())
                .filter(name -> {
                    try {
                        return BeanUtils.getPropertyDescriptor(source.getClass(), name).getReadMethod().invoke(source) == null;
                    } catch (Exception e) {
                        return false;
                    }
                }).toArray(String[]::new);
    }

    public void setActivation(User u,boolean b){
        userRepository.updateActivationById(u.getId(), b);
    }

    public User findById(String id)
    {
        User u = userRepository.getUserById(id);
        if (StringUtils.isNotEmpty(u.getPassword())) {
            u.setPassword(null);
        }
        return u;
    }


    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
    
}
