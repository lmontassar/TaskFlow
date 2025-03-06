package com.taskflow.server.Controllers;
import com.taskflow.server.Config.JWT;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.taskflow.server.Entities.LoginRequest;
import com.taskflow.server.Entities.LoginResponce;
import com.taskflow.server.Entities.OTPVerification;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Services.EmailService;
import com.taskflow.server.Services.OTPVerificationService;
import com.taskflow.server.Services.UserService;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;

import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private OTPVerificationService OTPVser;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("jwt.secret")
    private String secretKey;

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
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        
        try {
            User user = new User();

            // Validate email format
            if ( (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) 
            
            // Validate prenom and nom (only letters and spaces, but must start and end with a letter)
            || (!prenom.matches("^[A-Za-z]+( [A-Za-z]+)*$") || !nom.matches("^[A-Za-z]+( [A-Za-z]+)*$")) 

            // Validate title (only letters, spaces, and apostrophes, must start and end with a letter)
            || (!title.isEmpty() && !title.matches("^[A-Za-zÀ-ÖØ-öø-ÿ]+([ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$")) 

            // Validate phone number (digits only, 8-15 digits long)
            || (!phoneNumber.isEmpty() && !phoneNumber.matches("^(\\+\\d{1,3})?\\d{8,15}$")) 

            // Validate title (only letters, spaces, and apostrophes, must start and end with a letter)
            || (!title.isEmpty() && !title.matches("^[A-Za-zÀ-ÖØ-öø-ÿ]+([ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$")) 

            // Validate title (only letters, spaces, and apostrophes, must start and end with a letter)
            || (!password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")) )
                return ResponseEntity.status(406).build();

            if (image != null && !image.isEmpty()) {
                String contentType = image.getContentType();
                long maxSize = 5 * 1024 * 1024; // 5MB
                if (!contentType.matches("image/(jpeg|png|jpg)")) {
                    return ResponseEntity.status(415).build(); //415 Unsupported Media Type → If the image format is not JPEG or PNG.
                }
                if (image.getSize() > maxSize) {
                    return ResponseEntity.status(413).build(); //413 Payload Too Large → If the image size exceeds 5MB.
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

            User newUser = userService.createUser(user);
            if (newUser == null ) return ResponseEntity.status(409).build();

            int ret = OTPVser.setCode(email);

            switch (ret){
                case 1 : return ResponseEntity.status(403).build() ; // (You cannot resend the code before 1 hour) → 403 Forbidden (User must wait a long time before retrying)
                case 2 : return ResponseEntity.status(500).build() ; // (Email sending error) → 500 Internal Server Error
                case 3 : return ResponseEntity.status(429).build() ; // (You cannot resend the code before 60 seconds) → 429 Too Many Requests (Temporary rate limit: wait 60s)
            }

            String jwt = myJWT.generateToken(newUser);
            Map<String,String> res = new TreeMap<>();
            res.put("token", jwt);
            return ResponseEntity.ok(res);

        } catch (RuntimeException e) {
            return ResponseEntity.status(400).build();
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

    /*       reset password         */
    @PostMapping("/sendcode")
    public ResponseEntity<?> send(
        @RequestBody String email
        ) {
            
        try {
            return userService.findByEmail(email)
            .map(u->{
                OTPVser.setCode(u.getEmail());
                return ResponseEntity.status(200).build();
            }).orElse(ResponseEntity.status(404).build());
                            
        }catch (Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).build();
        }
    }
    @PostMapping("/resetpasswordtoken")
    public ResponseEntity<?> generateRPT(
        @RequestParam("otp") String otp,
        @RequestParam("email") String email
    ) { 
        try{
            if(OTPVser.verify(email, otp)) {
                User u = userService.findByEmail(email).orElse(null);
                String RPT = myJWT.generateResetPasswordToken(u);
                Map<String , String > res = new TreeMap<>();
                res.put("RPToken",RPT);
                return ResponseEntity.status(200).body( res);
            } else {
                return ResponseEntity.status(402).build();
            }

        } catch (Exception e){
            return ResponseEntity.status(400).build();
        }
    }

    @PostMapping("/resetpassword")
    public ResponseEntity<?> resetPassword(
        @RequestHeader("Authorization") String RPT,
        @RequestParam("password") String password
        ) {
        try{
            System.out.println(password+"--"+RPT);
            String id = myJWT.extractUserId(RPT);
            System.out.println(id);
            User u = userService.findById(id);
            System.out.println(id);
            if(u == null) return ResponseEntity.status(404).build();
            userService.resetPassword(u,password);
            return ResponseEntity.ok().build();
        } catch (Exception e){
            return ResponseEntity.status(400).build();
        }
    }
}