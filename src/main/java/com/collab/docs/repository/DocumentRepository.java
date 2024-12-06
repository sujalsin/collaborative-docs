package com.collab.docs.repository;

import com.collab.docs.model.Document;
import com.collab.docs.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    @Query("SELECT d FROM Document d WHERE d.owner = :owner OR " +
           "EXISTS (SELECT c FROM d.collaborators c WHERE c.userId = :userId) " +
           "ORDER BY d.lastModified DESC")
    Page<Document> findByOwnerOrCollaboratorsUserIdOrderByLastModifiedDesc(
            @Param("owner") User owner,
            @Param("userId") Long userId,
            Pageable pageable);

    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Document d " +
           "WHERE d.id = :documentId AND (d.owner = :user OR " +
           "EXISTS (SELECT c FROM d.collaborators c WHERE c.userId = :userId))")
    boolean existsByIdAndOwnerOrCollaborator(
            @Param("documentId") Long documentId,
            @Param("user") User user,
            @Param("userId") Long userId);
}
