package com.taskflow.server.Controllers;

import com.taskflow.server.Config.JWT;
import com.taskflow.server.Entities.Attachment;
import com.taskflow.server.Entities.Message;
import com.taskflow.server.Entities.Tache;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Services.MessageService;
import com.taskflow.server.Services.TacheService;
import com.taskflow.server.Services.UserService;
import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/attachments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow frontend calls
public class AttachmentsController {
    @Autowired
    private TacheService tacheService;

    @Autowired
    private JWT myJWT;
    @Autowired
    private UserService userService;
    @Autowired
    MessageService MsgService;

    private final String UPLOAD_DIR = "upload/attachments/";
    private final Path baseUploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();

    @PostMapping("/add/message/{MessageID}")
    public ResponseEntity<?> uploadMessageAttachment(
            @PathVariable String MessageID,
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String token) {
        try {
            User user = userService.findById(myJWT.extractUserId(token));
            if (user == null) {
                return ResponseEntity.status(403).build();
            }
            Message message = MsgService.findById(MessageID);
            if (!message.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).build();
            }
            Path taskFolderPath = baseUploadPath.resolve(message.getId());
            Files.createDirectories(taskFolderPath);
            String fileName = file.getOriginalFilename();
            Path filePath = taskFolderPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            Attachment attachment = new Attachment();
            attachment.setId(UUID.randomUUID().toString());
            attachment.setName(fileName);
            attachment.setSize(file.getSize());
            attachment.setType(file.getContentType());
            attachment.setCreatedAt(new Date());
            attachment.setUrl(message.getId() + "/" + fileName);
            message.getAttachments().add(attachment);
            MsgService.update(message);
            return ResponseEntity.ok(attachment);
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not upload file");
        } catch (java.io.IOException e) {
            throw new RuntimeException(e);
        }
    }

    @DeleteMapping("/message/{messageId}")
    public ResponseEntity<?> deleteMessageAttachment(
            @PathVariable String messageId,
            @RequestBody List<String> attachments,
            @RequestHeader("Authorization") String token) {
        try {
            User user = userService.findById(myJWT.extractUserId(token));
            if (user == null) {
                return ResponseEntity.status(403).build();
            }
            Message message = MsgService.findById(messageId);
            if (message == null) {
                return ResponseEntity.status(404).build();
            }
            if (!message.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).build();
            }
            System.out.println(attachments);
            for (String attachmentID : attachments) {

                Optional<Attachment> attachmentOpt = message.getAttachments()
                        .stream()
                        .filter(att -> att.getId().equals(attachmentID))
                        .findFirst();
                if (attachmentOpt.isPresent()) {
                    Attachment attachment = attachmentOpt.get();
                    Path filePath = baseUploadPath
                            .resolve(attachment.getUrl())
                            .normalize();
                    Files.deleteIfExists(filePath);
                    MsgService.removeAttachement(message, attachment);
                }

            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to delete attachment.");
        }
    }

    @PostMapping("/add/{tacheId}")
    public ResponseEntity<?> uploadAttachment(@PathVariable String tacheId,
            @RequestParam("file") MultipartFile file, @RequestHeader("Authorization") String token) {
        try {
            User user = userService.findById(myJWT.extractUserId(token));
            if (user == null) {
                return ResponseEntity.status(403).build();
            }

            Tache tache = tacheService.findTacheById(tacheId);
            if (!tacheService.isCreateur(user, tache) && !tacheService.IsUserExistInAsignee(user, tache)) {
                return ResponseEntity.status(403).build();
            }
            // Create directory uploads/{tacheId}/ if not exists
            Path taskFolderPath = baseUploadPath.resolve(tacheId);
            Files.createDirectories(taskFolderPath);

            String fileName = file.getOriginalFilename();
            Path filePath = taskFolderPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            Attachment attachment = new Attachment();
            attachment.setId(UUID.randomUUID().toString());
            attachment.setName(fileName);
            attachment.setSize(file.getSize());
            attachment.setType(file.getContentType());
            attachment.setCreatedAt(new Date());
            attachment.setUrl(tacheId + "/" + fileName);

            if (tache.getAttachments() == null) {
                tache.setAttachments(new ArrayList<>());
            }
            tache.getAttachments().add(attachment);
            tacheService.update(tache);

            return ResponseEntity.ok(attachment);

        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not upload file");
        } catch (java.io.IOException e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/file/{tacheId}/{filename}")
    public ResponseEntity<Resource> getFile(
            @PathVariable String tacheId,
            @RequestHeader("Authorization") String token,
            @PathVariable String filename) throws IOException, java.io.IOException {
        User user = userService.findById(myJWT.extractUserId(token));
        if (user == null) {
            return ResponseEntity.status(403).build();
        }

        Tache tache = tacheService.findTacheById(tacheId);
        Message message = MsgService.findById(tacheId);
        if ( tache != null && !tacheService.isCreateur(user, tache) && !tacheService.IsUserExistInAsignee(user, tache)) {
            return ResponseEntity.status(403).build();
        }
        if (tache == null && message == null ) return ResponseEntity.status(404).build();
        Path filePath = Paths.get(UPLOAD_DIR).resolve(tacheId).resolve(filename).normalize();

        Resource resource;
        try {
            resource = new UrlResource(filePath.toUri());
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        // Try to detect the file's content type
        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            contentType = "application/octet-stream"; // Default binary type
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/file/{tacheId}/{fileId}")
    public ResponseEntity<?> deleteAttachment(@PathVariable String tacheId, @PathVariable String fileId,
            @RequestHeader("Authorization") String token) {
        try {

            User user = userService.findById(myJWT.extractUserId(token));
            if (user == null) {
                return ResponseEntity.status(403).build();
            }

            Tache tache = tacheService.findTacheById(tacheId);
            if (!tacheService.isCreateur(user, tache) && !tacheService.IsUserExistInAsignee(user, tache)) {
                return ResponseEntity.status(403).build();
            }
            if (tache != null) {

                Optional<Attachment> attachmentOpt = tache.getAttachments()
                        .stream()
                        .filter(att -> att.getId().equals(fileId))
                        .findFirst();

                if (attachmentOpt.isPresent()) {
                    Attachment attachment = attachmentOpt.get();
                    String filename = attachment.getName();

                    Path filePath = Paths.get(UPLOAD_DIR + tacheId + "/").resolve(filename).normalize();
                    Files.deleteIfExists(filePath);

                    tache.getAttachments().remove(attachment);
                    tacheService.update(tache);

                    return ResponseEntity.ok("Attachment deleted successfully.");
                } else {
                    return ResponseEntity.status(404).body("Attachment not found.");
                }
            } else {
                return ResponseEntity.status(404).body("Tache not found.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to delete attachment.");
        }
    }

}
