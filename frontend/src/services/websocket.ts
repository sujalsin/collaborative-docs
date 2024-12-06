import { Client, Message } from '@stomp/stompjs';
import { DocumentEdit, CursorPosition } from '../types';

const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8080/ws';

class WebSocketService {
    private client: Client;
    private documentSubscriptions: Map<string, () => void>;
    private cursorSubscriptions: Map<string, () => void>;

    constructor() {
        this.client = new Client({
            brokerURL: WEBSOCKET_URL,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.documentSubscriptions = new Map();
        this.cursorSubscriptions = new Map();

        this.client.onConnect = () => {
            console.log('Connected to WebSocket');
        };

        this.client.onStompError = (frame) => {
            console.error('WebSocket error:', frame);
        };
    }

    connect() {
        this.client.activate();
    }

    disconnect() {
        this.client.deactivate();
    }

    subscribeToDocumentEdits(documentId: string, callback: (edit: DocumentEdit) => void): () => void {
        if (this.documentSubscriptions.has(documentId)) {
            return this.documentSubscriptions.get(documentId)!;
        }

        const subscription = this.client.subscribe(
            `/topic/document/${documentId}/edits`,
            (message: Message) => {
                const edit: DocumentEdit = JSON.parse(message.body);
                callback(edit);
            }
        );

        const unsubscribe = () => {
            subscription.unsubscribe();
            this.documentSubscriptions.delete(documentId);
        };

        this.documentSubscriptions.set(documentId, unsubscribe);
        return unsubscribe;
    }

    subscribeToCursorPositions(documentId: string, callback: (position: CursorPosition) => void): () => void {
        if (this.cursorSubscriptions.has(documentId)) {
            return this.cursorSubscriptions.get(documentId)!;
        }

        const subscription = this.client.subscribe(
            `/topic/document/${documentId}/cursors`,
            (message: Message) => {
                const position: CursorPosition = JSON.parse(message.body);
                callback(position);
            }
        );

        const unsubscribe = () => {
            subscription.unsubscribe();
            this.cursorSubscriptions.delete(documentId);
        };

        this.cursorSubscriptions.set(documentId, unsubscribe);
        return unsubscribe;
    }

    sendDocumentEdit(edit: DocumentEdit) {
        this.client.publish({
            destination: `/app/document/${edit.documentId}/edit`,
            body: JSON.stringify(edit),
        });
    }

    sendCursorPosition(position: CursorPosition) {
        this.client.publish({
            destination: `/app/document/${position.documentId}/cursor`,
            body: JSON.stringify(position),
        });
    }
}

export const webSocketService = new WebSocketService();
