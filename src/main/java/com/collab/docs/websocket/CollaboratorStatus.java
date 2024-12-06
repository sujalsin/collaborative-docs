package com.collab.docs.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollaboratorStatus {
    private Long userId;
    private String username;
    private String status; // JOINED, LEFT
    private Long documentId;
}
