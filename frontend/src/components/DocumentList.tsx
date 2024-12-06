import React, { useState, useEffect } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { Document } from '../types';
import { documentService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const DocumentList: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [newDocTitle, setNewDocTitle] = useState('');
    const [newDocDescription, setNewDocDescription] = useState('');
    
    const navigate = useNavigate();

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const docs = await documentService.getDocuments();
            setDocuments(docs);
            setLoading(false);
        } catch (err) {
            setError('Failed to load documents');
            setLoading(false);
        }
    };

    const handleCreateDocument = async () => {
        try {
            const newDoc = await documentService.createDocument(newDocTitle, newDocDescription);
            setDocuments([...documents, newDoc]);
            setOpenDialog(false);
            setNewDocTitle('');
            setNewDocDescription('');
            navigate(`/document/${newDoc.id}`);
        } catch (err) {
            setError('Failed to create document');
        }
    };

    const handleDeleteDocument = async (id: number) => {
        try {
            await documentService.deleteDocument(id);
            setDocuments(documents.filter(doc => doc.id !== id));
        } catch (err) {
            setError('Failed to delete document');
        }
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">My Documents</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    New Document
                </Button>
            </Box>

            <Paper elevation={3}>
                <List>
                    {documents.map((doc) => (
                        <ListItem
                            key={doc.id}
                            button
                            onClick={() => navigate(`/document/${doc.id}`)}
                        >
                            <ListItemText
                                primary={doc.title}
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="textSecondary">
                                            Last modified: {new Date(doc.lastModified).toLocaleString()}
                                        </Typography>
                                        <br />
                                        <Typography component="span" variant="body2" color="textSecondary">
                                            Collaborators: {doc.collaborators.length}
                                        </Typography>
                                    </>
                                }
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    aria-label="edit"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/document/${doc.id}`);
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteDocument(doc.id);
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Create New Document</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        fullWidth
                        value={newDocTitle}
                        onChange={(e) => setNewDocTitle(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        value={newDocDescription}
                        onChange={(e) => setNewDocDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreateDocument}
                        color="primary"
                        disabled={!newDocTitle.trim()}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
