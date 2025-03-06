package com.taskflow.server.Controllers;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.taskflow.server.Config.JWT;

import com.taskflow.server.Entities.*;
import org.springframework.http.*;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import com.taskflow.server.Services.EmailService;
import com.taskflow.server.Services.OTPVerificationService;
import com.taskflow.server.Services.UserService;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import com.google.api.client.json.jackson2.JacksonFactory;

import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String CLIENT_ID;
    @Autowired
    private OTPVerificationService OTPVser;

    @Autowired
    private EmailService emailService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("jwt.secret")
    private String secretKey;

    @Autowired
    private JWT myJWT;


    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String GH_CLIENT_ID;

    @Value("${spring.security.oauth2.client.registration.github.client-secret}")
    private String GH_CLIENT_SECRET;

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
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        
        try {
            User user = new User();

            // Validate email format
            if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) 
                return ResponseEntity.badRequest().body("Invalid email format.");  
            
            // Validate prenom and nom (only letters and spaces, but must start and end with a letter)
            if (!prenom.matches("^[A-Za-z]+( [A-Za-z]+)*$") || !nom.matches("^[A-Za-z]+( [A-Za-z]+)*$")) 
                return ResponseEntity.badRequest().body("Prenom and Nom must contain only letters and spaces, without leading or trailing spaces.");

            // Validate title (only letters, spaces, and apostrophes, must start and end with a letter)
            if (!title.isEmpty() && !title.matches("^[A-Za-zÀ-ÖØ-öø-ÿ]+([ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$")) 
                return ResponseEntity.badRequest().body("Invalid title format. Only letters, spaces, and apostrophes are allowed.");

            // Validate phone number (digits only, 8-15 digits long)
            if (!phoneNumber.isEmpty() && !phoneNumber.matches("^(\\+\\d{1,3})?\\d{8,15}$")) {
                return ResponseEntity.badRequest().body("Invalid phone number format.");
            }

            // Validate title (only letters, spaces, and apostrophes, must start and end with a letter)
            if (!title.isEmpty() && !title.matches("^[A-Za-zÀ-ÖØ-öø-ÿ]+([ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$")) {
                return ResponseEntity.badRequest().body("Invalid title format. Only letters, spaces, and apostrophes are allowed.");
            }

            // Validate title (only letters, spaces, and apostrophes, must start and end with a letter)
            /*if (!password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")) {
                return ResponseEntity.badRequest().body("Password must have at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.");
            }*/
            
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
            user.setActivation(false);
            user.setEmail(email);
            user.setNom(nom);
            user.setPrenom(prenom);
            user.setTitle(title);
            user.setPassword(password);
            System.out.println(user.toString());
            if(phoneNumber != ""){
                user.setPhoneNumber(phoneNumber);
            } else {
                user.setPhoneNumber(null);
            }

            if (image != null && !image.isEmpty()) {
                user.setAvatar(saveUserImage(image));
            }

            OTPVser.setCode(email);
            
            User newUser = userService.createUser(user);
            String jwt = myJWT.generateToken(newUser);
            Map<String,String> res = new TreeMap<>();
            res.put("token", jwt);
            return ResponseEntity.ok(res);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest authentication) {

        if (authentication != null) {
            User userInfo = new User();
            userInfo.setEmail(authentication.getEmail());
            userInfo.setNom(authentication.getNom());
            userInfo.setPrenom(authentication.getPrenom());
            userInfo.setAvatar(authentication.getImage());
            User user = userService.findOrCreateUser(userInfo);
            String jwtToken = myJWT.generateToken(user);
            LoginResponce loginResponse = new LoginResponce(jwtToken, user);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(loginResponse);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not authenticated.");
    }
    @PostMapping("/github")
    public ResponseEntity<?> githubAuth(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        RestTemplate restTemplate = new RestTemplate();

        String accessTokenUrl = "https://github.com/login/oauth/access_token";
        String userUrl = "https://api.github.com/user";

        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        // Exchange code for access token
        Map<String, String> params = new HashMap<>();
        params.put("client_id", GH_CLIENT_ID);
        params.put("client_secret", GH_CLIENT_SECRET);
        params.put("code", code);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(params, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(accessTokenUrl, entity, Map.class);

        if (response.getBody() != null && response.getBody().get("access_token") != null) {
            String accessToken = (String) response.getBody().get("access_token");

            // Use access token to get user info
            headers.setBearerAuth(accessToken);
            HttpEntity<String> userEntity = new HttpEntity<>(headers);
            ResponseEntity<Map> userResponse = restTemplate.exchange(userUrl, HttpMethod.GET, userEntity, Map.class);

            if (userResponse.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> userData = userResponse.getBody();
                User userInfo = new User();

                String email = (String) userData.get("email");
                if (email == null) {
                    // Use ID as a fallback for email (or handle differently if needed)
                    userInfo.setEmail(userData.get("id") + "@github.com");
                } else {
                    userInfo.setEmail(email);
                }

                String fullName = (String) userData.getOrDefault("name", "");
                String[] nameParts = fullName.split(" ", 2);  // Split into first and last name

                userInfo.setNom(nameParts[0]);                      // First name
                userInfo.setPrenom(nameParts.length > 1 ? nameParts[1] : "");

                userInfo.setAvatar((String) userData.getOrDefault("avatar_url", ""));

                User user = userService.findOrCreateUser(userInfo);

                String jwtToken = myJWT.generateToken(user);
                LoginResponce loginResponse = new LoginResponce(jwtToken, user);

                return ResponseEntity.status(HttpStatus.ACCEPTED).body(loginResponse);

            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid GitHub login.");
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
    
    @PostMapping("/resendcode")
    public ResponseEntity<?> resendCode(
            @RequestHeader("Authorization") String token
        ) {
            try{
                String s = myJWT.extractUserId(token);
                User u = userService.findById(s);
                OTPVser.setCode(u.getEmail());
                return ResponseEntity.ok("code sent");
            }catch(Exception e){
                return ResponseEntity.badRequest().body(e.getMessage());
            }
    }
    @PostMapping("/verifyEmail")
    public ResponseEntity<?> verifyEmail(
            @RequestHeader("Authorization") String token,
            @RequestBody String code
        ) {
            try{
                String s = myJWT.extractUserId(token);
                User u = userService.findById(s);
                if ( !OTPVser.verify(u.getEmail(),code) ){
                    return ResponseEntity.badRequest().body("Le code est erroné, réessayez");
                } 
                userService.setActivation(u,true);
                return ResponseEntity.ok().build();
            }catch(Exception e){
                System.out.println(e.getMessage());
                return ResponseEntity.badRequest().body(e.getMessage());
            }
    }
}
