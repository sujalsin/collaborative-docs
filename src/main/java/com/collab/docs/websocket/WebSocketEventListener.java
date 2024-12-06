package com.collab.docs.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        log.info("Received a new web socket connection");
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        String documentId = (String) headerAccessor.getSessionAttributes().get("documentId");

        if (username != null && documentId != null) {
            log.info("User {} disconnected from document {}", username, documentId);

            CollaboratorStatus status = CollaboratorStatus.builder()
                    .username(username)
                    .action("LEAVE")
                    .documentId(Long.parseLong(documentId))
                    .build();

            messagingTemplate.convertAndSend("/topic/document/" + documentId + "/collaborators", status);
        }
    }
}
