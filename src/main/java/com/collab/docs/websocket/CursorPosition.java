package com.collab.docs.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CursorPosition {
    private Long documentId;
    private String username;
    private Integer line;
    private Integer column;
}
