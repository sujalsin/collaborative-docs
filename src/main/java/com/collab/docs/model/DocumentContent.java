package com.collab.docs.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentContent {
    private String content;
    private Integer version;
    private String lastModifiedBy;
    private Long lastModifiedAt;
}
