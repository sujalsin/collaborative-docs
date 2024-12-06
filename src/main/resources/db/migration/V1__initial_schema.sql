-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- User roles
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id),
    roles VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, roles)
);

-- Documents table
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id BIGINT NOT NULL REFERENCES users(id),
    content_id VARCHAR(255),
    version INTEGER NOT NULL DEFAULT 1,
    last_modified TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL
);

-- Document collaborators
CREATE TABLE document_collaborators (
    document_id BIGINT NOT NULL REFERENCES documents(id),
    user_id BIGINT NOT NULL,
    permission VARCHAR(20) NOT NULL,
    added_at TIMESTAMP NOT NULL,
    PRIMARY KEY (document_id, user_id)
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_documents_owner ON documents(owner_id);
CREATE INDEX idx_documents_content ON documents(content_id);
CREATE INDEX idx_document_collaborators_user ON document_collaborators(user_id);
