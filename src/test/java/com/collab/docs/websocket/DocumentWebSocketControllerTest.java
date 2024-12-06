package com.collab.docs.websocket;

import com.collab.docs.model.DocumentContent;
import com.collab.docs.service.DocumentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest
class DocumentWebSocketControllerTest {

    @MockBean
    private SimpMessageSendingOperations messagingTemplate;

    @MockBean
    private DocumentService documentService;

    private DocumentWebSocketController controller;
    private SimpMessageHeaderAccessor headerAccessor;

    @BeforeEach
    void setUp() {
        controller = new DocumentWebSocketController(messagingTemplate, documentService);
        headerAccessor = mock(SimpMessageHeaderAccessor.class);
        
        Map<String, Object> sessionAttributes = new HashMap<>();
        when(headerAccessor.getSessionAttributes()).thenReturn(sessionAttributes);
    }

    @Test
    void joinDocument_ValidDocument_SuccessfulJoin() {
        // Arrange
        String documentId = "doc123";
        CollaboratorStatus status = new CollaboratorStatus();
        status.setUsername("testUser");
        
        when(documentService.documentExists(documentId)).thenReturn(true);
        when(documentService.getDocument(documentId)).thenReturn(new DocumentContent());

        // Act
        controller.joinDocument(documentId, status, headerAccessor);

        // Assert
        verify(messagingTemplate).convertAndSend(eq("/topic/document/" + documentId + "/users"), any(CollaboratorStatus.class));
        verify(messagingTemplate).convertAndSendToUser(eq("testUser"), eq("/queue/document.state"), any(DocumentContent.class));
        assertEquals("ONLINE", status.getStatus());
    }

    @Test
    void joinDocument_InvalidDocument_SendsError() {
        // Arrange
        String documentId = "invalid-doc";
        CollaboratorStatus status = new CollaboratorStatus();
        status.setUsername("testUser");
        
        when(documentService.documentExists(documentId)).thenReturn(false);

        // Act
        controller.joinDocument(documentId, status, headerAccessor);

        // Assert
        verify(messagingTemplate).convertAndSendToUser(
            eq("testUser"),
            eq("/queue/errors"),
            contains("Document not found")
        );
    }

    @Test
    void handleDocumentEdit_ValidEdit_BroadcastsUpdate() {
        // Arrange
        String documentId = "doc123";
        DocumentEditMessage editMessage = new DocumentEditMessage();
        editMessage.setUserId("user1");
        editMessage.setUsername("testUser");
        editMessage.setContent("new content");
        
        when(documentService.documentExists(documentId)).thenReturn(true);
        when(documentService.applyEdit(eq(documentId), any())).thenReturn(new DocumentContent());

        // Act
        controller.handleDocumentEdit(documentId, editMessage);

        // Assert
        verify(messagingTemplate).convertAndSend(eq("/topic/document/" + documentId + "/edits"), eq(editMessage));
        verify(messagingTemplate).convertAndSend(eq("/topic/document/" + documentId + "/state"), any(DocumentContent.class));
    }

    @Test
    void handleCursorMove_ValidPosition_BroadcastsPosition() {
        // Arrange
        String documentId = "doc123";
        CursorPosition position = new CursorPosition();
        position.setUsername("testUser");
        position.setPosition(10);

        // Act
        controller.handleCursorMove(documentId, position);

        // Assert
        verify(messagingTemplate).convertAndSend(
            eq("/topic/document/" + documentId + "/cursors"),
            eq(position)
        );
    }

    @Test
    void handleCursorMove_InvalidPosition_SendsError() {
        // Arrange
        String documentId = "doc123";
        CursorPosition position = new CursorPosition();
        position.setUsername("testUser");
        position.setPosition(-1);

        // Act
        controller.handleCursorMove(documentId, position);

        // Assert
        verify(messagingTemplate).convertAndSendToUser(
            eq("testUser"),
            eq("/queue/errors"),
            contains("Invalid cursor position")
        );
    }

    @Test
    void leaveDocument_SuccessfulLeave_BroadcastsStatus() {
        // Arrange
        String documentId = "doc123";
        CollaboratorStatus status = new CollaboratorStatus();
        status.setUsername("testUser");

        // Act
        controller.leaveDocument(documentId, status, headerAccessor);

        // Assert
        ArgumentCaptor<CollaboratorStatus> statusCaptor = ArgumentCaptor.forClass(CollaboratorStatus.class);
        verify(messagingTemplate).convertAndSend(
            eq("/topic/document/" + documentId + "/users"),
            statusCaptor.capture()
        );
        
        CollaboratorStatus broadcastStatus = statusCaptor.getValue();
        assertEquals("OFFLINE", broadcastStatus.getStatus());
        assertEquals("testUser", broadcastStatus.getUsername());
    }
}
