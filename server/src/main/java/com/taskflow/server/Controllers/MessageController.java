package com.taskflow.server.Controllers;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taskflow.server.Entities.Attachment;
import com.taskflow.server.Entities.Message;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Entities.User;
import com.taskflow.server.Services.MessageService;
import com.taskflow.server.Services.ProjectService;
import com.taskflow.server.Services.UserService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@RequestMapping("/chat")
@RestController
public class MessageController {
    @Autowired
    private MessageService MsgSer;

    @Autowired
    private UserService userService;

    @Autowired
    private ProjectService projectService;

    private static boolean canAddmessage = false;
    private static boolean canReadmessage = false;

    private final String UPLOAD_DIR = "upload/attachments/";
    private final Path baseUploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();

    public void ResetPrivilege() {
        canAddmessage = false;
        canReadmessage = false;
    }

    public void setAllPrivilegeTrue() {
        canAddmessage = true;
        canReadmessage = true;
    }

    public User setPrivilege(String token, Project p) {
        User u = userService.getUserFromToken(token);
        if (u == null)
            return null;

        if (projectService.isCollaborator(u, p) || p.getCreateur().equals(u)) {
            canAddmessage = true;
            canReadmessage = true;
        }
        return u;
    }

    @PostMapping("/add")
    public ResponseEntity<?> AddMessage(
            @RequestHeader("Authorization") String token,
            @RequestBody Message message) {
        try {
            Project p = projectService.getProjectById(message.getProject().getId());
            if (p == null)
                return ResponseEntity.notFound().build();
            User user = setPrivilege(token, p);
            if (canAddmessage == false)
                ResponseEntity.status(403).build();
            message.setCreatedAt(LocalDateTime.now());
            message.setUser(user);
            System.out.println(message);
            Message newMessage = MsgSer.AddMessage(message);
            if (newMessage != null) {
                p.addMessages(newMessage);
                projectService.UpdateChat(p);
                return ResponseEntity.ok().body(newMessage);
            }
            return ResponseEntity.status(416).build();
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/edit")
    public ResponseEntity<?> EditMessage(
            @RequestHeader("Authorization") String token,
            @RequestBody Message message) {
        try {
            Project p = projectService.getProjectById(message.getProject().getId());
            if (p == null)
                return ResponseEntity.notFound().build();
            User user = setPrivilege(token, p);
            Message oldMessage = MsgSer.findById(message.getId());
            if (oldMessage.getUser().getId().equals(user.getId()) == false)
                ResponseEntity.status(403).build();
            oldMessage.setText(message.getText());
            oldMessage.setEdited(true);
            MsgSer.update(oldMessage);
            return ResponseEntity.ok().body(oldMessage);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete/{messageID}")
    public ResponseEntity<?> DeleteMessage(
            @RequestHeader("Authorization") String token,
            @PathVariable String messageID
            ) {
        try {
            Message oldMessage = MsgSer.findById(messageID);
            Project p = projectService.getProjectById(oldMessage.getProject().getId());
            if (p == null)
                return ResponseEntity.notFound().build();
            User user = setPrivilege(token, p);

            if (oldMessage.getUser().getId().equals(user.getId()) == false)
                ResponseEntity.status(403).build();

            for (Attachment atta : oldMessage.getAttachments()) {
                Optional<Attachment> attachmentOpt = oldMessage.getAttachments()
                        .stream()
                        .filter(att -> att.getId().equals(atta.getId()))
                        .findFirst();
                if (attachmentOpt.isPresent()) {
                    Attachment attachment = attachmentOpt.get();
                    Path filePath = baseUploadPath
                            .resolve(attachment.getUrl())
                            .normalize();
                    Files.deleteIfExists(filePath);
                }
            }
            MsgSer.delete(oldMessage);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get/project")
    public ResponseEntity<?> AddMessage(
            @RequestHeader("Authorization") String token,
            @RequestParam String projectID) {
        try {
            Project p = projectService.getProjectById(projectID);
            if (p == null)
                return ResponseEntity.notFound().build();
            setPrivilege(token, p);
            if (canReadmessage == false)
                ResponseEntity.status(403).build();
            List<Message> messages = MsgSer.getAllByProject(p);
            return ResponseEntity.ok().body(messages);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
}
