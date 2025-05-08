package com.taskflow.server.Listeners;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.taskflow.server.Entities.Message;

@Component
public class ChatEventListener extends AbstractMongoEventListener<Message> {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public void onAfterSave( AfterSaveEvent<Message> event ) {
        Message message = event.getSource();
        messagingTemplate.convertAndSend(
                "/topic/messages/" + message.getProject().getId(),
                message
        );
        super.onAfterSave(event);
    }
}