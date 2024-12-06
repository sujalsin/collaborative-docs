package com.collab.docs.websocket;

import com.collab.docs.model.DocumentContent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.lang.reflect.Type;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class WebSocketIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private ObjectMapper objectMapper;

    private WebSocketStompClient stompClient;
    private final WebSocketHttpHeaders headers = new WebSocketHttpHeaders();

    @BeforeEach
    void setup() {
        this.stompClient = new WebSocketStompClient(new StandardWebSocketClient());
        this.stompClient.setMessageConverter(new MappingJackson2MessageConverter());
    }

    @Test
    void testDocumentCollaboration() throws Exception {
        CompletableFuture<DocumentContent> documentFuture = new CompletableFuture<>();
        CompletableFuture<CollaboratorStatus> statusFuture = new CompletableFuture<>();

        StompSessionHandler sessionHandler = new TestStompSessionHandler(documentFuture, statusFuture);
        
        StompSession session = stompClient
            .connectAsync("ws://localhost:" + port + "/ws", headers, sessionHandler)
            .get(5, TimeUnit.SECONDS);

        // Subscribe to document updates
        session.subscribe("/topic/document/test-doc/state", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return DocumentContent.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                documentFuture.complete((DocumentContent) payload);
            }
        });

        // Subscribe to user status updates
        session.subscribe("/topic/document/test-doc/users", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return CollaboratorStatus.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                statusFuture.complete((CollaboratorStatus) payload);
            }
        });

        // Send join message
        CollaboratorStatus joinStatus = new CollaboratorStatus();
        joinStatus.setUsername("testUser");
        session.send("/app/document.join/test-doc", joinStatus);

        // Wait for responses
        CollaboratorStatus receivedStatus = statusFuture.get(5, TimeUnit.SECONDS);
        assertNotNull(receivedStatus);
        assertEquals("ONLINE", receivedStatus.getStatus());
        assertEquals("testUser", receivedStatus.getUsername());

        // Clean up
        session.disconnect();
    }

    private static class TestStompSessionHandler extends StompSessionHandlerAdapter {
        private final CompletableFuture<DocumentContent> documentFuture;
        private final CompletableFuture<CollaboratorStatus> statusFuture;

        public TestStompSessionHandler(
            CompletableFuture<DocumentContent> documentFuture,
            CompletableFuture<CollaboratorStatus> statusFuture
        ) {
            this.documentFuture = documentFuture;
            this.statusFuture = statusFuture;
        }

        @Override
        public void handleFrame(StompHeaders headers, Object payload) {
            if (payload instanceof DocumentContent) {
                documentFuture.complete((DocumentContent) payload);
            } else if (payload instanceof CollaboratorStatus) {
                statusFuture.complete((CollaboratorStatus) payload);
            }
        }

        @Override
        public void handleException(StompSession session, StompCommand command, StompHeaders headers, byte[] payload, Throwable exception) {
            exception.printStackTrace();
            documentFuture.completeExceptionally(exception);
            statusFuture.completeExceptionally(exception);
        }

        @Override
        public void handleTransportError(StompSession session, Throwable exception) {
            exception.printStackTrace();
            documentFuture.completeExceptionally(exception);
            statusFuture.completeExceptionally(exception);
        }
    }
}
