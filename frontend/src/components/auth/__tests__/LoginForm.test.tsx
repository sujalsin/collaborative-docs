import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from '../LoginForm';
import { AuthProvider } from '../../../context/AuthContext';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('LoginForm', () => {
    const renderLoginForm = () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <LoginForm />
                </AuthProvider>
            </BrowserRouter>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders login form with all fields', () => {
        renderLoginForm();
        
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows error when submitting empty form', async () => {
        renderLoginForm();
        
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        
        await waitFor(() => {
            expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
        });
    });

    it('navigates to register page when clicking sign up link', () => {
        renderLoginForm();
        
        fireEvent.click(screen.getByText(/don't have an account\? sign up/i));
        
        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('handles successful login', async () => {
        renderLoginForm();
        
        fireEvent.change(screen.getByLabelText(/username/i), {
            target: { value: 'testuser' },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' },
        });
        
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });
});
