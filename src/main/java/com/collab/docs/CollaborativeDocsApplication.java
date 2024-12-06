package com.collab.docs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.collab.docs.repository")
public class CollaborativeDocsApplication {
    public static void main(String[] args) {
        SpringApplication.run(CollaborativeDocsApplication.class, args);
    }
}
