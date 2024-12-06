package com.collab.docs.controller;

import com.collab.docs.model.Document;
import com.collab.docs.model.User;
import com.collab.docs.service.DocumentService;
import com.collab.docs.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService documentService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<Document> createDocument(@RequestBody CreateDocumentRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Document document = documentService.createDocument(request.title, request.content, user);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocument(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Document document = documentService.getDocument(id);
        if (!documentService.canEdit(document, user)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(document);
    }

    @GetMapping
    public ResponseEntity<List<Document>> getUserDocuments(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Document> documents = documentService.getUserDocuments(user);
        return ResponseEntity.ok(documents);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Document> updateDocument(@PathVariable Long id, @RequestBody UpdateDocumentRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Document document = documentService.getDocument(id);
        if (!documentService.canEdit(document, user)) {
            return ResponseEntity.status(403).build();
        }
        document = documentService.updateDocument(id, request.content);
        return ResponseEntity.ok(document);
    }

    @PostMapping("/{id}/collaborators")
    public ResponseEntity<?> addCollaborator(@PathVariable Long id, @RequestBody AddCollaboratorRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Document document = documentService.getDocument(id);
        if (!document.getOwner().equals(user)) {
            return ResponseEntity.status(403).build();
        }
        User collaborator = userService.findById(request.userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        documentService.addCollaborator(document, collaborator);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/collaborators/{userId}")
    public ResponseEntity<?> removeCollaborator(@PathVariable Long id, @PathVariable Long userId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Document document = documentService.getDocument(id);
        if (!document.getOwner().equals(user)) {
            return ResponseEntity.status(403).build();
        }
        User collaborator = userService.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        documentService.removeCollaborator(document, collaborator);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class CreateDocumentRequest {
        private String title;
        private String content;
    }

    @Data
    public static class UpdateDocumentRequest {
        private String content;
    }

    @Data
    public static class AddCollaboratorRequest {
        private Long userId;
    }
}
