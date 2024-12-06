package com.collab.docs.repository.jpa;

import com.collab.docs.model.Document;
import com.collab.docs.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    Page<Document> findByOwner(User owner, Pageable pageable);
    
    @Query("SELECT d FROM Document d LEFT JOIN FETCH d.collaborators WHERE d.id = :id")
    Optional<Document> findByIdWithCollaborators(@Param("id") Long id);
    
    @Query("SELECT d FROM Document d WHERE d.owner = :user OR " +
           "EXISTS (SELECT c FROM d.collaborators c WHERE c.user = :user)")
    Page<Document> findAccessibleDocuments(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT d FROM Document d WHERE d.title LIKE %:searchTerm% OR d.content LIKE %:searchTerm% AND " +
           "(d.owner = :user OR EXISTS (SELECT c FROM d.collaborators c WHERE c.user = :user))")
    Page<Document> searchDocuments(@Param("searchTerm") String searchTerm, @Param("user") User user, Pageable pageable);
    
    @Query("SELECT d FROM Document d WHERE d.content LIKE %:searchTerm%")
    List<Document> findByContentContainingIgnoreCase(@Param("searchTerm") String searchTerm);
}
