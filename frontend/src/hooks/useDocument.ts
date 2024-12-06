import { useState, useEffect, useCallback } from 'react';
import { EditorState, ContentState, convertToRaw, convertFromRaw } from 'draft-js';
import { Document, DocumentEdit, CursorPosition } from '../types';
import { documentService } from '../services/api';
import { webSocketService } from '../services/websocket';

export const useDocument = (documentId: number) => {
    const [document, setDocument] = useState<Document | null>(null);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [collaborators, setCollaborators] = useState<CursorPosition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load document data
    useEffect(() => {
        const loadDocument = async () => {
            try {
                const doc = await documentService.getDocument(documentId);
                setDocument(doc);
                
                // Initialize editor state from document content if available
                if (doc.content) {
                    const contentState = convertFromRaw(JSON.parse(doc.content));
                    setEditorState(EditorState.createWithContent(contentState));
                }
                
                setLoading(false);
            } catch (err) {
                setError('Failed to load document');
                setLoading(false);
            }
        };

        loadDocument();
    }, [documentId]);

    // Set up WebSocket subscriptions
    useEffect(() => {
        if (!document) return;

        const unsubscribeEdits = webSocketService.subscribeToDocumentEdits(
            documentId.toString(),
            handleDocumentEdit
        );

        const unsubscribeCursors = webSocketService.subscribeToCursorPositions(
            documentId.toString(),
            handleCursorUpdate
        );

        return () => {
            unsubscribeEdits();
            unsubscribeCursors();
        };
    }, [document]);

    const handleDocumentEdit = useCallback((edit: DocumentEdit) => {
        setEditorState((currentState) => {
            const contentState = currentState.getCurrentContent();
            const selection = currentState.getSelection();
            
            let newContent: ContentState;

            switch (edit.operation) {
                case 'INSERT':
                    newContent = contentState.merge({
                        selectionBefore: selection,
                        selectionAfter: selection.merge({
                            anchorOffset: edit.position + (edit.content?.length || 0),
                            focusOffset: edit.position + (edit.content?.length || 0),
                        }),
                    }) as ContentState;
                    break;

                case 'DELETE':
                    newContent = contentState.merge({
                        selectionBefore: selection,
                        selectionAfter: selection.merge({
                            anchorOffset: edit.position,
                            focusOffset: edit.position + (edit.length || 0),
                        }),
                    }) as ContentState;
                    break;

                case 'REPLACE':
                    newContent = contentState.merge({
                        selectionBefore: selection,
                        selectionAfter: selection.merge({
                            anchorOffset: edit.position + (edit.content?.length || 0),
                            focusOffset: edit.position + (edit.content?.length || 0),
                        }),
                    }) as ContentState;
                    break;

                default:
                    return currentState;
            }

            return EditorState.push(currentState, newContent, 'apply-entity');
        });
    }, []);

    const handleCursorUpdate = useCallback((position: CursorPosition) => {
        setCollaborators((current) => {
            const filtered = current.filter(c => c.username !== position.username);
            return [...filtered, position];
        });
    }, []);

    const sendEdit = useCallback((edit: DocumentEdit) => {
        webSocketService.sendDocumentEdit(edit);
    }, []);

    const updateCursorPosition = useCallback((position: CursorPosition) => {
        webSocketService.sendCursorPosition(position);
    }, []);

    return {
        document,
        editorState,
        setEditorState,
        collaborators,
        loading,
        error,
        sendEdit,
        updateCursorPosition,
    };
};
