import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentEditor } from '../DocumentEditor';
import { AuthProvider } from '../../../context/AuthContext';

// Mock Draft.js Editor
jest.mock('draft-js', () => ({
    Editor: jest.fn(() => null),
    EditorState: {
        createEmpty: jest.fn(() => ({})),
        createWithContent: jest.fn(() => ({})),
    },
    convertToRaw: jest.fn(),
    convertFromRaw: jest.fn(),
    RichUtils: {
        toggleInlineStyle: jest.fn(),
        toggleBlockType: jest.fn(),
    },
}));

describe('DocumentEditor', () => {
    const mockDocumentId = '123';
    
    const renderEditor = () => {
        render(
            <AuthProvider>
                <DocumentEditor documentId={mockDocumentId} />
            </AuthProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders editor with toolbar', () => {
        renderEditor();
        
        expect(screen.getByRole('toolbar')).toBeInTheDocument();
        expect(screen.getByLabelText(/text editor/i)).toBeInTheDocument();
    });

    it('shows comments drawer when comment button is clicked', () => {
        renderEditor();
        
        const commentButton = screen.getByRole('button', { name: /comments/i });
        fireEvent.click(commentButton);
        
        expect(screen.getByRole('complementary')).toBeInTheDocument();
        expect(screen.getByText(/comments/i)).toBeInTheDocument();
    });

    it('toggles formatting when toolbar buttons are clicked', () => {
        renderEditor();
        
        const boldButton = screen.getByRole('button', { name: /bold/i });
        fireEvent.click(boldButton);
        
        // Verify that the button state changes
        expect(boldButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('handles collaborative editing', async () => {
        renderEditor();
        
        // Simulate another user's edit
        const mockWebSocket = global.WebSocket as jest.Mock;
        const mockAddEventListener = mockWebSocket.mock.results[0].value.addEventListener;
        
        const mockMessage = {
            data: JSON.stringify({
                type: 'CONTENT_CHANGE',
                payload: {
                    content: 'Updated content',
                    userId: 'user2',
                },
            }),
        };
        
        mockAddEventListener.mock.calls
            .find(([event]) => event === 'message')[1](mockMessage);
        
        await waitFor(() => {
            expect(screen.getByText(/user2 is editing/i)).toBeInTheDocument();
        });
    });
});
