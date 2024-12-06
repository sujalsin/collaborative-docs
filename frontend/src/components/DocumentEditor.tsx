import React, { useCallback, useState } from 'react';
import { Editor, EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { useDocument } from '../hooks/useDocument';
import { DocumentEdit, CursorPosition } from '../types';
import {
    Box,
    CircularProgress,
    Typography,
    Paper,
    Drawer,
    IconButton,
    Tooltip,
    AppBar,
    Toolbar as MuiToolbar,
} from '@mui/material';
import {
    Comment as CommentIcon,
    People as PeopleIcon,
    History as HistoryIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { Toolbar } from './editor/Toolbar';
import { Comment } from './editor/Comment';
import { useAuth } from '../context/AuthContext';

interface DocumentEditorProps {
    documentId: number;
}

interface CommentType {
    id: string;
    author: string;
    content: string;
    timestamp: string;
    replies?: CommentType[];
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ documentId }) => {
    const {
        document,
        editorState,
        setEditorState,
        collaborators,
        loading,
        error,
        sendEdit,
        updateCursorPosition,
    } = useDocument(documentId);

    const { user } = useAuth();
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [comments, setComments] = useState<CommentType[]>([]);
    const [selectedText, setSelectedText] = useState('');

    const handleChange = useCallback(
        (newState: EditorState) => {
            const currentContent = editorState.getCurrentContent();
            const newContent = newState.getCurrentContent();

            if (currentContent !== newContent) {
                const edit: DocumentEdit = {
                    documentId: documentId.toString(),
                    userId: user?.id || 0,
                    username: user?.username || '',
                    operation: 'REPLACE',
                    position: 0,
                    content: JSON.stringify(convertToRaw(newContent)),
                    timestamp: Date.now(),
                };

                sendEdit(edit);
            }

            setEditorState(newState);
        },
        [editorState, documentId, user, sendEdit, setEditorState]
    );

    const handleSelectionChange = useCallback(() => {
        const selection = editorState.getSelection();
        const position: CursorPosition = {
            username: user?.username || '',
            documentId: documentId.toString(),
            position: selection.getAnchorOffset(),
            selectionStart: selection.getStartOffset(),
            selectionEnd: selection.getEndOffset(),
            timestamp: Date.now(),
        };

        updateCursorPosition(position);

        // Update selected text for comments
        const content = editorState.getCurrentContent();
        const selectedText = content
            .getBlockForKey(selection.getStartKey())
            .getText()
            .slice(selection.getStartOffset(), selection.getEndOffset());
        setSelectedText(selectedText);
    }, [editorState, documentId, user, updateCursorPosition]);

    const handleAddComment = () => {
        if (!selectedText) return;

        const newComment: CommentType = {
            id: Date.now().toString(),
            author: user?.username || '',
            content: '',
            timestamp: new Date().toISOString(),
            replies: [],
        };

        setComments([...comments, newComment]);
        setCommentsOpen(true);
    };

    const handleEditComment = (id: string, content: string) => {
        setComments(
            comments.map((comment) =>
                comment.id === id ? { ...comment, content } : comment
            )
        );
    };

    const handleDeleteComment = (id: string) => {
        setComments(comments.filter((comment) => comment.id !== id));
    };

    const handleReplyToComment = (id: string, content: string) => {
        setComments(
            comments.map((comment) => {
                if (comment.id === id) {
                    return {
                        ...comment,
                        replies: [
                            ...(comment.replies || []),
                            {
                                id: Date.now().toString(),
                                author: user?.username || '',
                                content,
                                timestamp: new Date().toISOString(),
                            },
                        ],
                    };
                }
                return comment;
            })
        );
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box height="100vh" display="flex" flexDirection="column">
            <AppBar position="static" color="default" elevation={0}>
                <MuiToolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {document?.title || 'Untitled Document'}
                    </Typography>
                    <Box>
                        <Tooltip title="Comments">
                            <IconButton onClick={() => setCommentsOpen(true)}>
                                <CommentIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Collaborators">
                            <IconButton>
                                <PeopleIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Version History">
                            <IconButton>
                                <HistoryIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </MuiToolbar>
                <Toolbar
                    editorState={editorState}
                    onStyleChange={handleChange}
                    onAddComment={handleAddComment}
                />
            </AppBar>

            <Box flex={1} p={3} bgcolor="#f5f5f5">
                <Paper elevation={3}>
                    <Box
                        sx={{
                            padding: 2,
                            minHeight: '500px',
                            '& .DraftEditor-root': {
                                height: '100%',
                            },
                        }}
                    >
                        <Editor
                            editorState={editorState}
                            onChange={handleChange}
                            onBlur={handleSelectionChange}
                        />
                    </Box>
                </Paper>
            </Box>

            <Drawer
                anchor="right"
                open={commentsOpen}
                onClose={() => setCommentsOpen(false)}
                sx={{ '& .MuiDrawer-paper': { width: 320 } }}
            >
                <Box p={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Comments</Typography>
                        <IconButton onClick={() => setCommentsOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    {comments.map((comment) => (
                        <Comment
                            key={comment.id}
                            {...comment}
                            onDelete={handleDeleteComment}
                            onEdit={handleEditComment}
                            onReply={handleReplyToComment}
                        />
                    ))}
                </Box>
            </Drawer>
        </Box>
    );
};
