package com.collab.docs.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentEditMessage {
    private String content;
    private Integer startPosition;
    private Integer endPosition;
    private String operation; // INSERT, DELETE, REPLACE
}
