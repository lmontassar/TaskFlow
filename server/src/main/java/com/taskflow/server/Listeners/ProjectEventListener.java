package com.taskflow.server.Listeners;
import com.taskflow.server.Entities.Project;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class ProjectEventListener extends AbstractMongoEventListener<Project> {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public void onAfterSave(AfterSaveEvent<Project> event) {
        Project project = event.getSource();
        messagingTemplate.convertAndSend(
                "/topic/projects/" + project.getId(),
                project
        );
        super.onAfterSave(event);
    }
}
