package com.taskflow.server.Listeners;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent;
import org.springframework.data.mongodb.core.mapping.event.BeforeDeleteEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import com.taskflow.server.Entities.Message;
import com.taskflow.server.Repositories.MessageRepository;

@Component
public class ChatEventListener extends AbstractMongoEventListener<Message> {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private MessageRepository messageRepository;

    @Override
    public void onAfterSave(AfterSaveEvent<Message> event) {
        Message message = event.getSource();
        messagingTemplate.convertAndSend(
                "/topic/messages/" + message.getProject().getId(),
                message);
        super.onAfterSave(event);
    }
    @Override
    public void onBeforeDelete(BeforeDeleteEvent<Message> event) {
        String messageID = event.getSource().getObjectId("_id").toHexString();

        // Load full message from database
        Optional<Message> messageOpt = messageRepository.findById(messageID);

        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            String projectID = message.getProject().getId(); // assuming getProject() returns an object with getId()

            messagingTemplate.convertAndSend(
                    "/topic/message/delete/" + projectID  ,
                    messageID);
        } else {
            System.err.println("Message with ID " + messageID + " not found for deletion.");
        }
    }

}