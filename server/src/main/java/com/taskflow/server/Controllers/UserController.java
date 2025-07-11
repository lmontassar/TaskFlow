package com.taskflow.server.Controllers;

import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.*;
import com.taskflow.server.Services.LoginSecurityService;
import jakarta.mail.MessagingException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import com.taskflow.server.Services.OTPVerificationService;
import com.taskflow.server.Services.UserService;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

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

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("jwt.secret")
    private String secretKey;

    @Autowired
    private JWT myJWT;
    @Autowired
    private LoginSecurityService loginSecurityService;

    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String GH_CLIENT_ID;

    @Value("${spring.security.oauth2.client.registration.github.client-secret}")
    private String GH_CLIENT_SECRET;

    @GetMapping("/avatar/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(filename);
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }

    private String saveUserImage(MultipartFile image) throws IOException {

        Files.createDirectories(Paths.get(uploadDir));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(image.getOriginalFilename()));
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = "avatar_" + LocalDateTime.now().format(formatter) + extension;

        Files.copy(image.getInputStream(), Paths.get(uploadDir + newFilename), StandardCopyOption.REPLACE_EXISTING);
        return newFilename;
    }

    @PostMapping("/register")
    public ResponseEntity<?> signUp(
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("prenom") String prenom,
            @RequestParam("nom") String nom,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam("title") String title,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {

            if ((!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$"))
                    || (!prenom.matches("^[A-Za-z]+( [A-Za-z]+)*$") || !nom.matches("^[A-Za-z]+( [A-Za-z]+)*$"))
                    || (!title.isEmpty() && !title.matches("^[A-Za-zÀ-ÖØ-öø-ÿ]+([ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$"))
                    || (!phoneNumber.isEmpty() && !phoneNumber.matches("^(\\+\\d{1,3})?\\d{8,15}$"))
                    || (!password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")))
                return ResponseEntity.status(406).build();

            if (image != null && !image.isEmpty()) {
                String contentType = image.getContentType();
                long maxSize = 5 * 1024 * 1024; // 5MB
                if (!contentType.matches("image/(jpeg|png|jpg)")) {
                    return ResponseEntity.status(415).build(); // 415 Unsupported Media Type → If the image format is
                                                               // not JPEG or PNG.
                }
                if (image.getSize() > maxSize) {
                    return ResponseEntity.status(413).build(); // 413 Payload Too Large → If the image size exceeds 5MB.
                }
            }
            User user = new User();
            user.setActivation(false);
            user.setEmail(email);
            user.setNom(nom);
            user.setPrenom(prenom);
            user.setTitle(title);
            user.setTwoFactorAuth(false);
            user.setPassword(password);
            user.setCreationDate(LocalDateTime.now());
            if (phoneNumber != "") {
                user.setPhoneNumber(phoneNumber);
            }

            if (image != null && !image.isEmpty()) {
                user.setAvatar(saveUserImage(image));
            }
            User newUser = userService.createUser(user);
            if (newUser == null)
                return ResponseEntity.status(409).build();

            int ret = OTPVser.setCode(email);
            switch (ret) {
                case 1:
                    return ResponseEntity.status(403).build(); // (You cannot resend the code before 1 hour) → 403
                                                               // Forbidden (User must wait a long time before retrying)
                case 2:
                    return ResponseEntity.status(500).build(); // (Email sending error) → 500 Internal Server Error
                case 3:
                    return ResponseEntity.status(429).build(); // (You cannot resend the code before 60 seconds) → 429
                                                               // Too Many Requests (Temporary rate limit: wait 60s)
            }

            String jwt = myJWT.generateToken(newUser);
            Map<String, String> res = new TreeMap<>();
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
                    if (u.getBlocked()) {
                        return ResponseEntity.status(400).build();
                    }
                    if (userService.validatePassword(user.getPassword(), u.getPassword())) {
                        String jwt;
                        if (u.getTwoFactorAuth()) {
                            jwt = myJWT.generateTwoFactoAuthToken(u);
                        } else {
                            jwt = myJWT.generateToken(u);
                        }
                        LoginResponce lr = new LoginResponce(jwt, u);
                        int ret = OTPVser.setCode(u.getEmail());
                        return ResponseEntity.status(HttpStatus.ACCEPTED).body(lr);
                    } else {
                        try {
                            loginSecurityService.checkAttempt(user.getEmail());
                        } catch (MessagingException e) {
                            throw new RuntimeException(e);
                        }
                        return ResponseEntity.status(400).build();
                    }
                })
                .orElse(ResponseEntity.status(400).build());
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest authentication) {

        if (authentication != null) {
            User userInfo = new User();
            userInfo.setEmail(authentication.getEmail());
            userInfo.setNom(authentication.getNom());
            userInfo.setPrenom(authentication.getPrenom());
            userInfo.setAvatar(authentication.getImage());
            userInfo.setCreationDate(LocalDateTime.now());
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
                HttpHeaders headerss = new HttpHeaders();
                headerss.setBearerAuth(accessToken);
                headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

                HttpEntity<String> entityy = new HttpEntity<>(headers);

                RestTemplate restTemplates = new RestTemplate();
                ResponseEntity<List<Map<String, Object>>> responses = restTemplate.exchange(
                        "https://api.github.com/user/emails",
                        HttpMethod.GET,
                        entity,
                        new ParameterizedTypeReference<>() {
                        });

                List<Map<String, Object>> emails = responses.getBody();
                if (emails != null && !emails.isEmpty()) {
                    Map<String, Object> firstEmailEntry = emails.get(0);
                    String email = (String) firstEmailEntry.get("email");
                    if (email == null) {
                        // Use ID as a fallback for email (or handle differently if needed)
                        userInfo.setEmail(userData.get("id") + "@github.com");
                    } else {
                        userInfo.setEmail(email);
                    }
                } else {
                    userInfo.setEmail(userData.get("id") + "@github.com");
                }

                String fullName = (String) userData.getOrDefault("name", "");
                if (fullName == null) {
                    fullName = "";
                }
                String[] nameParts = fullName.split(" ", 2); // Split into first and last name
                userInfo.setNom(nameParts[0]); // First name
                userInfo.setPrenom(nameParts.length > 1 ? nameParts[1] : "");
                userInfo.setAvatar((String) userData.getOrDefault("avatar_url", ""));
                userInfo.setCreationDate(LocalDateTime.now());
                User user = userService.findOrCreateUser(userInfo);
                String jwtToken = myJWT.generateToken(user);
                LoginResponce loginResponse = new LoginResponce(jwtToken, user);
                return ResponseEntity.status(HttpStatus.ACCEPTED).body(loginResponse);

            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid GitHub login.");
    }

    @PostMapping("/resendcode")
    public ResponseEntity<?> resendCode(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(value = "email", required = false) String email) {
        try {
            User u = null;
            if (token != null) {
                String s = myJWT.extractUserId(token);
                u = userService.findById(s);
            } else if (email != null) {
                u = userService.findByEmail(email).orElse(null);
            }

            if (u == null)
                return ResponseEntity.notFound().build();
            int ret = OTPVser.setCode(u.getEmail());
            switch (ret) {
                case 1:
                    return ResponseEntity.status(403).build(); // (You cannot resend the code before 1 hour) → 403
                                                               // Forbidden (User must wait a long time before retrying)
                case 2:
                    return ResponseEntity.status(500).build(); // (Email sending error) → 500 Internal Server Error
                case 3:
                    return ResponseEntity.status(429).build(); // (You cannot resend the code before 60 seconds) → 429
                                                               // Too Many Requests (Temporary rate limit: wait 60s)
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verifyEmail")
    public ResponseEntity<?> verifyEmail(
            @RequestHeader("Authorization") String token,
            @RequestBody String code) {
        try {
            String s = myJWT.extractUserId(token);
            User u = userService.findById(s);
            if (u == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 404 Not Found
            }
            int res = OTPVser.verify(u.getEmail(), code);
            switch (res) {
                case 0:
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401 Unauthorized
                case 2:
                    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build(); // 429 Too Many Requests
                case 3:
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Forbidden
            }
            userService.setActivation(u, true);
            return ResponseEntity.ok().build(); // 200 OK
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 Internal Server Error
        }
    }

    @PostMapping("/sendcode")
    public ResponseEntity<?> send(
            @RequestBody String email) {

        try {
            System.out.println(email);
            return userService.findByEmail(email)
                    .map(u -> {
                        OTPVser.setCode(u.getEmail());
                        return ResponseEntity.status(200).build();
                    }).orElse(ResponseEntity.status(404).build());

        } catch (Exception e) {
            return ResponseEntity.status(400).build();
        }
    }

    @PostMapping("/resetpasswordtoken")
    public ResponseEntity<?> generateRPT(
            @RequestParam("otp") String otp,
            @RequestParam("email") String email) {
        try {
            int r = OTPVser.verify(email, otp);
            if (r == 1) {
                User u = userService.findByEmail(email).orElse(null);
                String RPT = myJWT.generateResetPasswordToken(u);
                Map<String, String> res = new TreeMap<>();
                res.put("RPToken", RPT);
                return ResponseEntity.status(200).body(res);
            } else {
                switch (r) {
                    case 0:
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401 Unauthorized
                    case 2:
                        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build(); // 429 Too Many Requests
                    default:
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Forbidden
                }
            }

        } catch (Exception e) {
            return ResponseEntity.status(400).build();
        }
    }

    @PostMapping("/resetpassword")
    public ResponseEntity<?> resetPassword(
            @RequestHeader("Authorization") String RPT,
            @RequestParam("password") String password) {
        try {
            if (myJWT.isTokenExpired(RPT) == true)
                return ResponseEntity.status(401).build();
            String id = myJWT.extractUserId(RPT);
            User u = userService.findById(id);
            if (u == null)
                return ResponseEntity.status(404).build();
            userService.resetPassword(u, password);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(400).build();
        }
    }

    @PostMapping("/twofactoauth")
    public ResponseEntity<?> twoFactorAuth(
            @RequestHeader("Authorization") String TFAToken,
            @RequestBody String otp) {
        try {
            if (myJWT.isTokenExpired(TFAToken) == true)
                return ResponseEntity.status(401).build();

            String id = myJWT.extractUserId(TFAToken);
            User u = userService.findById(id);
            if (u == null)
                return ResponseEntity.status(404).build();
            int r = OTPVser.verify(u.getEmail(), otp);
            if (r == 1) {
                String jwt = myJWT.generateToken(u);
                LoginResponce lr = new LoginResponce(jwt, u);
                return ResponseEntity.status(HttpStatus.ACCEPTED).body(lr);
            } else {
                switch (r) {
                    case 0:
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401 Unauthorized
                    case 2:
                        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build(); // 429 Too Many Requests
                    default:
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Forbidden
                }
            }

        } catch (Exception e) {
            return ResponseEntity.status(400).build();
        }
    }

    @GetMapping("/get")
    public ResponseEntity<?> getOneById(
            @RequestHeader("Authorization") String jwt) {
        try {
            if (myJWT.isTokenExpired(jwt) == true) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403
            }
            String id = myJWT.extractUserId(jwt);
            User u = userService.findById(id);
            if (u == null)
                return ResponseEntity.status(404).build();
            return ResponseEntity.ok().body(u); // 200
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null); // 403
        }
    }

    @PutMapping("/update/settings")
    public ResponseEntity<?> putMethodName(
            @RequestHeader("Authorization") String token,
            @RequestParam(value = "twoFactorAuth") boolean twoFactorAuth) {
        try {

            String id = myJWT.extractUserId(token);
            User user = userService.findById(id);
            if (user == null)
                return ResponseEntity.notFound().build(); // 404

            user.setTwoFactorAuth(twoFactorAuth);

            User updatedUser = userService.updateById(id, user);
            if (updatedUser == null)
                return ResponseEntity.status(404).build();
            return ResponseEntity.ok().build(); // 200
        } catch (Exception e) {
            return ResponseEntity.status(400).build(); // 403
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(
            @RequestHeader("Authorization") String token,
            @RequestParam("prenom") String prenom,
            @RequestParam("nom") String nom,
            @RequestParam("title") String title,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam("bio") String bio,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar) {
        try {

            if (token == null || myJWT.isTokenExpired(token) == true) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403
            }
            String id = myJWT.extractUserId(token);
            User user = userService.findById(id);
            if (user == null)
                return ResponseEntity.notFound().build(); // 404

            if ((!prenom.matches("^[A-Za-z]+( [A-Za-z]+)*$") || !nom.matches("^[A-Za-z]+( [A-Za-z]+)*$")) ||
                    (!title.isEmpty() && !title.matches("^[A-Za-zÀ-ÖØ-öø-ÿ]+([ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$")) ||
                    (!phoneNumber.isEmpty() && !phoneNumber.matches("^(\\+\\d{1,3})?\\d{8,15}$"))

            )
                return ResponseEntity.status(406).build();

            if (avatar != null && !avatar.isEmpty()) {
                String contentType = avatar.getContentType();
                long maxSize = 5 * 1024 * 1024; // 5MB
                if (!contentType.matches("image/(jpeg|png|jpg)")) {
                    return ResponseEntity.status(415).build(); // 415 Unsupported Media Type → If the image format is
                                                               // not JPEG or PNG.
                }
                if (avatar.getSize() > maxSize) {
                    return ResponseEntity.status(413).build(); // 413 Payload Too Large → If the image size exceeds 5MB.
                }
            }

            user.setNom(nom);
            user.setPrenom(prenom);
            if (title != "")
                user.setTitle(title);
            if (bio != "")
                user.setBio(bio);
            if (phoneNumber != "")
                user.setPhoneNumber(phoneNumber);
            if (avatar != null && !avatar.isEmpty()) {
                user.setAvatar(saveUserImage(avatar));
            }
            User updatedUser = userService.updateById(id, user);
            if (updatedUser == null)
                return ResponseEntity.status(404).build();
            return ResponseEntity.ok().build(); // 200
        } catch (Exception e) {
            return ResponseEntity.status(400).build(); // 403
        }

    }

    @GetMapping("/search")
    public List<?> searchUsers(@RequestParam String query, @RequestParam String projectId) {

        return userService.search(query, projectId);
    }
}