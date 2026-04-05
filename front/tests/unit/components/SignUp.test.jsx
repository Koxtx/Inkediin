import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SignUp from '../../../src/pages/Auth/SignUp';
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

const renderSignUp = (authValue = {}) => {
  const defaultAuthValue = {
    registerUser: vi.fn(),
    loading: false,
    ...authValue
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={defaultAuthValue}>
        <SignUp />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('SignUp Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sign up form', () => {
    renderSignUp();

    expect(screen.getByText(/Créer votre compte Inkediin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Adresse email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Mot de passe$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmer le mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /S'inscrire/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderSignUp();

    const submitButton = screen.getByRole('button', { name: /S'inscrire/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Le champ email est obligatoire/i)).toBeInTheDocument();
    });
  });

  it('should validate password requirements', async () => {
    const user = userEvent.setup();
    renderSignUp();

    const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
    await user.type(passwordInput, '123');

    const submitButton = screen.getByRole('button', { name: /S'inscrire/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Le mot de passe doit contenir au moins 8 caractères/i)).toBeInTheDocument();
    });
  });

  it('should validate password confirmation', async () => {
    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText(/^Mot de passe$/i), 'Password123!');
    await user.type(screen.getByLabelText(/Confirmer le mot de passe/i), 'DifferentPassword');

    const submitButton = screen.getByRole('button', { name: /S'inscrire/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Les mots de passe ne correspondent pas/i)).toBeInTheDocument();
    });
  });

  it('should require RGPD acceptance', async () => {
    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText(/Adresse email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/^Mot de passe$/i), 'Password123!');
    await user.type(screen.getByLabelText(/Confirmer le mot de passe/i), 'Password123!');

    const submitButton = screen.getByRole('button', { name: /S'inscrire/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Vous devez accepter les termes et conditions/i)).toBeInTheDocument();
    });
  });




  it('should navigate to signin after successful registration', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.fn().mockResolvedValue({
      success: true
    });

    renderSignUp({ registerUser: mockRegister });

    await user.type(screen.getByLabelText(/Adresse email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/^Mot de passe$/i), 'Password123!');
    await user.type(screen.getByLabelText(/Confirmer le mot de passe/i), 'Password123!');
    await user.click(screen.getByLabelText(/J'accepte les/i));
    await user.click(screen.getByRole('button', { name: /S'inscrire/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    renderSignUp();

    const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButtons = screen.getAllByRole('button', { name: '' });
    await user.click(toggleButtons[0]);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('should have link to sign in page', () => {
    renderSignUp();

    const signInLink = screen.getByRole('link', { name: /Se connecter/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/signin');
  });
});