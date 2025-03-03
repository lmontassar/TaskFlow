package com.taskflow.server.Services;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.taskflow.server.Entities.LoginRequest;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Repositories.UserRepository;

import java.util.Arrays;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User createUser(User user) {
        // if (userRepository.findByUsername(user.getUsername()).isPresent()) {
        //     throw new RuntimeException("Username already exists");
        // }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.findByPhoneNumber(user.getPhoneNumber()).isPresent()) {
            throw new RuntimeException("Phone number already exists");
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

    public User findById(String id)
    {
        return userRepository.getUserById(id);
    }


    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
    
}
