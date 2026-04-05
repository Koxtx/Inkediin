import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';

// Mock user pour les tests
export const mockUser = {
  _id: '123',
  id: '123',
  email: 'test@test.com',
  nom: 'Test User',
  userType: 'tatoueur',
  photoProfil: null,
  localisation: 'Paris',
  bio: 'Test bio',
  styles: 'Japonais',
  isProfileCompleted: true
};

// Provider de test personnalisé
export const AllTheProviders = ({ children, authValue = {} }) => {
  const defaultAuthValue = {
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    registerUser: vi.fn(),
    updateUser: vi.fn(),
    isAuthenticated: false,
    ...authValue
  };

  return (
    <BrowserRouter>
      <AuthContext.Provider value={defaultAuthValue}>
        {children}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

// Fonction render personnalisée
export const renderWithProviders = (ui, options = {}) => {
  const { authValue, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders authValue={authValue}>{children}</AllTheProviders>
    ),
    ...renderOptions
  });
};

// Mock de fetch
export const mockFetch = (data, ok = true) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(data),
      status: ok ? 200 : 400,
    })
  );
};

// Réexporter tout de testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };