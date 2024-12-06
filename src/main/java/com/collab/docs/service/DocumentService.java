package com.collab.docs.service;

import com.collab.docs.model.Document;
import com.collab.docs.model.User;
import com.collab.docs.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;

    @Transactional
    public Document createDocument(String title, String content, User owner) {
        Document document = Document.builder()
                .title(title)
                .content(content)
                .owner(owner)
                .build();
        return documentRepository.save(document);
    }

    @Transactional(readOnly = true)
    public Document getDocument(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + documentId));
    }

    @Transactional(readOnly = true)
    public String getDocumentContent(Long documentId) {
        Document document = getDocument(documentId);
        return document.getContent();
    }

    @Transactional
    public Document save(Document document) {
        return documentRepository.save(document);
    }

    @Transactional
    public Document updateDocument(Long documentId, String content) {
        Document document = getDocument(documentId);
        document.setContent(content);
        document.setLastModified(LocalDateTime.now());
        return documentRepository.save(document);
    }

    @Transactional
    public void deleteDocument(Long documentId) {
        documentRepository.deleteById(documentId);
    }

    @Transactional(readOnly = true)
    public List<Document> getUserDocuments(User user) {
        return documentRepository.findByOwnerIdOrCollaboratorsContaining(user.getId(), user);
    }

    @Transactional
    public void addCollaborator(Document document, User collaborator) {
        document.getCollaborators().add(collaborator);
        documentRepository.save(document);
    }

    @Transactional
    public void removeCollaborator(Document document, User collaborator) {
        document.getCollaborators().remove(collaborator);
        documentRepository.save(document);
    }

    @Transactional(readOnly = true)
    public boolean canEdit(Document document, User user) {
        return document.getOwner().equals(user) || document.getCollaborators().contains(user);
    }
}
