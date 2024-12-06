export interface User {
    id: number;
    username: string;
    email: string;
    roles: string[];
}

export interface Document {
    id: number;
    title: string;
    description?: string;
    owner: User;
    collaborators: DocumentCollaborator[];
    version: number;
    lastModified: string;
    createdAt: string;
}

export interface DocumentCollaborator {
    userId: number;
    permission: 'READ' | 'COMMENT' | 'EDIT' | 'ADMIN';
    addedAt: string;
}

export interface DocumentEdit {
    documentId: string;
    userId: number;
    username: string;
    operation: 'INSERT' | 'DELETE' | 'REPLACE';
    position: number;
    content?: string;
    length?: number;
    timestamp: number;
}

export interface CursorPosition {
    username: string;
    documentId: string;
    position: number;
    selectionStart: number;
    selectionEnd: number;
    timestamp: number;
}

export interface AuthResponse {
    accessToken: string;
    tokenType: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}
