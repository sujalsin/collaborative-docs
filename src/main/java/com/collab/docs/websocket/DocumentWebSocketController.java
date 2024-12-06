package com.collab.docs.websocket;

import com.collab.docs.model.Document;
import com.collab.docs.model.User;
import com.collab.docs.service.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
@Slf4j
public class DocumentWebSocketController {
    private final DocumentService documentService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/document/{documentId}/join")
    public void joinDocument(@DestinationVariable Long documentId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        log.info("User {} joined document {}", user.getUsername(), documentId);

        CollaboratorStatus status = CollaboratorStatus.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .status("JOINED")
                .documentId(documentId)
                .build();

        messagingTemplate.convertAndSend("/topic/document/" + documentId + "/collaborators", status);
    }

    @MessageMapping("/document/{documentId}/leave")
    public void leaveDocument(@DestinationVariable Long documentId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        log.info("User {} left document {}", user.getUsername(), documentId);

        CollaboratorStatus status = CollaboratorStatus.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .status("LEFT")
                .documentId(documentId)
                .build();

        messagingTemplate.convertAndSend("/topic/document/" + documentId + "/collaborators", status);
    }

    @MessageMapping("/document/{documentId}/edit")
    public void handleDocumentEdit(@DestinationVariable Long documentId,
                                 @Payload DocumentEditMessage editMessage,
                                 Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        log.info("User {} edited document {}", user.getUsername(), documentId);

        Document document = documentService.getDocument(documentId);
        document.setContent(editMessage.getContent());
        document.setLastModified(LocalDateTime.now());
        documentService.save(document);

        messagingTemplate.convertAndSend("/topic/document/" + documentId + "/content", editMessage);
    }

    @MessageMapping("/document/{documentId}/cursor")
    public void handleCursorMove(@DestinationVariable Long documentId,
                               @Payload CursorPosition cursorPosition,
                               Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        log.info("User {} moved cursor in document {}", user.getUsername(), documentId);

        cursorPosition.setUsername(user.getUsername());
        messagingTemplate.convertAndSend("/topic/document/" + documentId + "/cursors", cursorPosition);
    }
}
