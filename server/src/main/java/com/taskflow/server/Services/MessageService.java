package com.taskflow.server.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.taskflow.server.Entities.Attachment;
import com.taskflow.server.Entities.Message;
import com.taskflow.server.Entities.Project;
import com.taskflow.server.Repositories.MessageRepository;

@Service
public class MessageService {
    @Autowired
    private MessageRepository MsgRepo;
    
    @Autowired
    public SimpMessagingTemplate messagingTemplate;

    
    public Message AddMessage(Message m) {
        return MsgRepo.save(m);
    }
    public List<Message> getAllByProject(Project p) {
        return MsgRepo.findByProject(p);
    }
    public Message findById(String id) {
        return MsgRepo.findById(id).orElse(null);
    }

    public Message removeAttachement(Message message,Attachment attachment){
        message.removeAttachment(attachment);
        Message newM = MsgRepo.save(message);
        return newM;
    }

    public Message update(Message message)  {
        return MsgRepo.save(message);
    }
    public void delete(Message message) {
        MsgRepo.delete(message);
    }
}
