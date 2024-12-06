import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    IconButton,
    Avatar,
    Divider,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Reply as ReplyIcon,
} from '@mui/icons-material';

interface CommentProps {
    id: string;
    author: string;
    content: string;
    timestamp: string;
    onDelete: (id: string) => void;
    onEdit: (id: string, content: string) => void;
    onReply: (id: string, content: string) => void;
}

export const Comment: React.FC<CommentProps> = ({
    id,
    author,
    content,
    timestamp,
    onDelete,
    onEdit,
    onReply,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [editContent, setEditContent] = useState(content);
    const [replyContent, setReplyContent] = useState('');

    const handleSaveEdit = () => {
        onEdit(id, editContent);
        setIsEditing(false);
    };

    const handleSubmitReply = () => {
        onReply(id, replyContent);
        setIsReplying(false);
        setReplyContent('');
    };

    return (
        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
                <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                    {author[0].toUpperCase()}
                </Avatar>
                <Box flex={1}>
                    <Typography variant="subtitle2">{author}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {new Date(timestamp).toLocaleString()}
                    </Typography>
                </Box>
                <Box>
                    <IconButton size="small" onClick={() => setIsEditing(true)}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(id)}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setIsReplying(true)}>
                        <ReplyIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            {isEditing ? (
                <Box mt={1}>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        size="small"
                    />
                    <Box mt={1} display="flex" justifyContent="flex-end" gap={1}>
                        <Button
                            size="small"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={handleSaveEdit}
                        >
                            Save
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Typography variant="body2">{content}</Typography>
            )}

            {isReplying && (
                <Box mt={2}>
                    <Divider sx={{ my: 1 }} />
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        size="small"
                    />
                    <Box mt={1} display="flex" justifyContent="flex-end" gap={1}>
                        <Button
                            size="small"
                            onClick={() => setIsReplying(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={handleSubmitReply}
                            disabled={!replyContent.trim()}
                        >
                            Reply
                        </Button>
                    </Box>
                </Box>
            )}
        </Paper>
    );
};
