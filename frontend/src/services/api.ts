import axios from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, Document, DocumentEdit } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', data);
        localStorage.setItem('token', response.data.accessToken);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<void> => {
        await api.post('/auth/register', data);
    },

    logout: () => {
        localStorage.removeItem('token');
    },
};

export const documentService = {
    getDocuments: async (): Promise<Document[]> => {
        const response = await api.get('/documents');
        return response.data;
    },

    getDocument: async (id: number): Promise<Document> => {
        const response = await api.get(`/documents/${id}`);
        return response.data;
    },

    createDocument: async (title: string, description?: string): Promise<Document> => {
        const response = await api.post('/documents', { title, description });
        return response.data;
    },

    updateDocument: async (id: number, title: string, description?: string): Promise<Document> => {
        const response = await api.put(`/documents/${id}`, { title, description });
        return response.data;
    },

    deleteDocument: async (id: number): Promise<void> => {
        await api.delete(`/documents/${id}`);
    },

    addCollaborator: async (documentId: number, userId: number, permission: string): Promise<void> => {
        await api.post(`/documents/${documentId}/collaborators`, { userId, permission });
    },

    removeCollaborator: async (documentId: number, userId: number): Promise<void> => {
        await api.delete(`/documents/${documentId}/collaborators/${userId}`);
    },

    revertVersion: async (documentId: number, version: number): Promise<Document> => {
        const response = await api.post(`/documents/${documentId}/revert`, { version });
        return response.data;
    },
};
