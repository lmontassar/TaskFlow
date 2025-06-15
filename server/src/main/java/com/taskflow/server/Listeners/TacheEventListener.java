package com.taskflow.server.Listeners;
import com.taskflow.server.Entities.Tache;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class TacheEventListener extends AbstractMongoEventListener<Tache> {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public void onAfterSave(AfterSaveEvent<Tache> event) {
        Tache tache = event.getSource();
        System.out.println("task updated");
        messagingTemplate.convertAndSend(
                "/topic/tasks/" + tache.getId(),
                tache
        );
        super.onAfterSave(event);
    }
}
