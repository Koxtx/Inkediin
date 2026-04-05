import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SignIn from '../../../src/pages/Auth/SignIn';
import { AuthContext } from '../../../src/context/AuthContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

const renderSignIn = (authValue = {}) => {
  const defaultAuthValue = {
    login: vi.fn(),
    loading: false,
    ...authValue
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={defaultAuthValue}>
        <SignIn />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('SignIn Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sign in form', () => {
    renderSignIn();

    expect(screen.getByText(/Connexion à Inkediin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Adresse email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderSignIn();

    const submitButton = screen.getByRole('button', { name: /Se connecter/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Le champ email est obligatoire/i)).toBeInTheDocument();
      expect(screen.getByText(/Le champ mot de passe est obligatoire/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderSignIn();

    const emailInput = screen.getByLabelText(/Adresse email/i);
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /Se connecter/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Format de votre email non valide/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid credentials', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue({
      success: true,
      isFirstLogin: false
    });

    renderSignIn({ login: mockLogin });

    const emailInput = screen.getByLabelText(/Adresse email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);

    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'Password123!');

    const submitButton = screen.getByRole('button', { name: /Se connecter/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'Password123!'
      });
    });
  });

  it('should navigate to home after successful login', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue({
      success: true,
      isFirstLogin: false
    });

    renderSignIn({ login: mockLogin });

    await user.type(screen.getByLabelText(/Adresse email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/Mot de passe/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    }, { timeout: 3000 });
  });

  it('should navigate to setup profile for first login', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue({
      success: true,
      isFirstLogin: true
    });

    renderSignIn({ login: mockLogin });

    await user.type(screen.getByLabelText(/Adresse email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/Mot de passe/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/setupprofil');
    }, { timeout: 3000 });
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    renderSignIn();

    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: '' });
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should have link to sign up page', () => {
    renderSignIn();

    const signUpLink = screen.getByRole('link', { name: /S'inscrire/i });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute('href', '/signup');
  });

  it('should have link to forgot password page', () => {
    renderSignIn();

    const forgotPasswordLink = screen.getByRole('link', { name: /Mot de passe oublié/i });
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgotpassword');
  });

  it('should disable form during submission', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));

    renderSignIn({ login: mockLogin });

    await user.type(screen.getByLabelText(/Adresse email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/Mot de passe/i), 'Password123!');

    const submitButton = screen.getByRole('button', { name: /Se connecter/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByLabelText(/Adresse email/i)).toBeDisabled();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeDisabled();
  });
});