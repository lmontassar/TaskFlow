package com.taskflow.server.Controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.server.Entities.LoginRequest;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Services.UserService;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.RequestEntity;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

    @Value("${file.upload-dir}")
    private String uploadDir;
    
    @PostMapping("/register")
    public ResponseEntity postMethodName(
            @RequestParam("UserData") String UserDataJson ,
            @RequestParam("file") MultipartFile image
        ) {
        try{
            ObjectMapper objectMapper = new ObjectMapper();
            User UserData = objectMapper.readValue(UserDataJson, User.class);
            Instant now = Instant.now();
            long epochMicros = now.getEpochSecond() * 1_000_000 + now.getNano() / 1_000;
            String filename = "profileimage_"+ epochMicros +image.getOriginalFilename().substring( image.getOriginalFilename().lastIndexOf("."));
            Path uploadPath = Paths.get(System.getProperty("user.dir"), uploadDir).toAbsolutePath(); //get or create the directory
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(filename); 
            Files.copy(image.getInputStream(), filePath);
            UserData.setAvatar(filename); 
            UserData.setPassword( passwordEncoder.encode( UserData.getPassword() ) );
            User u = userService.addUser(UserData);

            if( u == null ) throw new Exception();
            return ResponseEntity.ok().build();
        } catch(Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    

}
