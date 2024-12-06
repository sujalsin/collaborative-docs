package com.collab.docs.repository.jpa;

import com.collab.docs.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface DocumentContentRepository extends JpaRepository<Document, Long> {
    Optional<Document> findById(Long id);
    
    @Query("SELECT d FROM Document d WHERE d.content LIKE %:searchTerm%")
    List<Document> findByContentContainingIgnoreCase(String searchTerm);
    
    @Query("SELECT d FROM Document d LEFT JOIN FETCH d.collaborators WHERE d.id = :id")
    Optional<Document> findByIdWithCollaborators(Long id);
}
