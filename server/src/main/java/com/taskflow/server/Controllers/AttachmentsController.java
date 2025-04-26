package com.taskflow.server.Controllers;

import com.taskflow.server.Entities.Attachment;
import com.taskflow.server.Entities.Tache;
import com.taskflow.server.Repositories.TacheRepository;
import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
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
    private TacheRepository tacheRepository;
    private final String UPLOAD_DIR ="upload/attachments/";
    private final Path baseUploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
    @PostMapping("/add/{tacheId}")
    public ResponseEntity<?> uploadAttachment(@PathVariable String tacheId,
                                              @RequestParam("file") MultipartFile file) {
        try {
            Optional<Tache> optionalTache = tacheRepository.findById(tacheId);
            if (optionalTache.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tache not found");
            }

            Tache tache = optionalTache.get();

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
            attachment.setUrl(tacheId+"/"+fileName);

            if (tache.getAttachments() == null) {
                tache.setAttachments(new ArrayList<>());
            }
            tache.getAttachments().add(attachment);

            tacheRepository.save(tache);

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
            @PathVariable String filename
    ) throws IOException, java.io.IOException {

        Path filePath = Paths.get(UPLOAD_DIR).resolve(tacheId).resolve(filename).normalize();
        System.out.println("Requested file path: " + filePath);

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

}
