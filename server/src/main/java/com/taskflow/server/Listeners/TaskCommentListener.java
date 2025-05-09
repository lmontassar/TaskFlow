package com.taskflow.server.Listeners;

import com.taskflow.server.Entities.TaskComment;
import com.taskflow.server.Services.TaskCommentService;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.AfterDeleteEvent;
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent;
import org.springframework.data.mongodb.core.mapping.event.BeforeDeleteEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TaskCommentListener extends AbstractMongoEventListener<TaskComment> {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private TaskCommentService taskCommentService;

    @Override
    public void onAfterSave(AfterSaveEvent<TaskComment> event) {
        TaskComment taskComment = event.getSource();
        List<TaskComment> taskCommentList =taskCommentService.getTaskCommentByTask(taskComment.getTask().getId());
        messagingTemplate.convertAndSend(
                "/topic/comments/" + taskComment.getTask().getId(),
                taskCommentList
        );
        super.onAfterSave(event);
    }

    @Override
    public void onBeforeDelete(BeforeDeleteEvent<TaskComment> event) {
        Document source = event.getSource();

        // Extract the _id of the comment to be deleted
        Object commentIdObj = source.get("_id");
        if (commentIdObj == null) return;

        String commentId = commentIdObj.toString();
        // Fetch the TaskComment from the database using the ID to access the task reference

        TaskComment comment =taskCommentService.getById(commentId);
        String taskId = comment.getTask().getId();
        // Get the updated list of comments for the task
        List<TaskComment> updatedComments = taskCommentService.getTaskCommentByTask(taskId);
        updatedComments.removeIf(c -> c.getId().equals(commentId));
        // Broadcast the update
        messagingTemplate.convertAndSend("/topic/comments/" + taskId, updatedComments);

        super.onBeforeDelete(event);
    }


}
