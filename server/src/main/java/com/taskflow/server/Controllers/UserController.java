package com.taskflow.server.Controllers;
import com.taskflow.server.Config.JWT;

import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.server.Entities.LoginRequest;
import com.taskflow.server.Entities.LoginResponce;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Services.UserService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

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

    @Autowired
    private JWT myJWT;


    private String saveUserImage(MultipartFile image) throws IOException {
        String uploadDir = "upload/avatar/";

        Files.createDirectories(Paths.get(uploadDir));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(image.getOriginalFilename()));
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = "avatar_" + LocalDateTime.now().format(formatter) + extension;

        Files.copy(image.getInputStream(), Paths.get(uploadDir + newFilename), StandardCopyOption.REPLACE_EXISTING);
        return newFilename;
    }

    @PostMapping("/register")
    public ResponseEntity<?> signUp(@RequestParam("email") String email,
                                    @RequestParam("password") String password,
                                    @RequestParam("prenom") String prenom,
                                    @RequestParam("nom") String nom,
                                    @RequestParam("phoneNumber") String phoneNumber,
                                    @RequestParam("title") String title,
                                    @RequestParam("image") MultipartFile image) {
        
        try {
            User user = new User();

            // Validate email format
            if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) 
                return ResponseEntity.badRequest().body("Invalid email format.");

            // Validate password (at least 8 characters, 1 uppercase, 1 digit, 1 special char)
            if (!password.matches("^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")) 
                return ResponseEntity.badRequest().body("Password must have at least 8 characters, one uppercase letter, one number, and one special character.");
            
            
            // Validate prenom and nom (only letters and spaces, but must start and end with a letter)
            if (!prenom.matches("^[A-Za-z]+( [A-Za-z]+)*$") || !nom.matches("^[A-Za-z]+( [A-Za-z]+)*$")) 
                return ResponseEntity.badRequest().body("Prenom and Nom must contain only letters and spaces, without leading or trailing spaces.");
            

            // Validate phone number (digits only, 8-15 digits long)
            if (!phoneNumber.isEmpty() && !phoneNumber.matches("^\\d{8,15}$")) 
                return ResponseEntity.badRequest().body("Invalid phone number format.");
            

            // Validate title (only letters, spaces, and apostrophes, must start and end with a letter)
            if (!title.isEmpty() && !title.matches("^[A-Za-zÀ-ÖØ-öø-ÿ]+([ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$")) 
                return ResponseEntity.badRequest().body("Invalid title format. Only letters, spaces, and apostrophes are allowed.");
            

            
            // Validate image (check size and format)
            if (image != null && !image.isEmpty()) {
                String contentType = image.getContentType();
                long maxSize = 5 * 1024 * 1024; // 5MB
                if (!contentType.matches("image/(jpeg|png|jpg)")) {
                    return ResponseEntity.badRequest().body("Only JPEG, PNG images are allowed.");
                }
                if (image.getSize() > maxSize) {
                    return ResponseEntity.badRequest().body("Image size must be under 5MB.");
                }
            }
            
            user.setEmail(email);
            user.setNom(nom);
            user.setPrenom(prenom);

            if(phoneNumber!="")
                user.setPhoneNumber(phoneNumber);
            if(title!="")
                user.setTitle(title);

            user.setPassword(password);



            if (image != null && !image.isEmpty()) {
                user.setAvatar(saveUserImage(image));
            }

            User newUser = userService.createUser(user);
            return ResponseEntity.ok(newUser);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest user) {
        return userService.findByEmail(user.getEmail())
                .map(u -> {
                    if (userService.validatePassword(user.getPassword(), u.getPassword())) {
                        String jwt = myJWT.generateToken(u);
                        LoginResponce lr = new LoginResponce(jwt,u);
                        return ResponseEntity.status(HttpStatus.ACCEPTED).body(lr);
                    } else {
                        return ResponseEntity.badRequest().body("Invalid password");
                    }
                })
                .orElse(ResponseEntity.badRequest().body("User not found"));
    }
    

}
