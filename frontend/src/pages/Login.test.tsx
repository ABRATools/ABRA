import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';
import { useToast } from '@/hooks/use-toast';

// mockin gstuff
// api
global.fetch = jest.fn();

// toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn()
  }),
}));

// window
const originalLocation = window.location;
Object.defineProperty(window, 'location', {
  configurable: true,
  value: { href: '' },
  writable: true
});

// describing basic loign component

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({ token: 'fake-token' }),
    });
  });

  afterAll(() => {
    // restore window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
      writable: true
    });
  });

  test('should login successfully with correct credentials', async () => {
    // render the login component
    render(<Login />);
    
    // form elements
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // fill in form with correct credentials
    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    
    // submit
    fireEvent.click(submitButton);
    
    // verify fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: 'admin', 
          password: '12345678' 
        }),
      });
    });
    
    // check loading stat
    expect(submitButton).toHaveTextContent(/signing in/i);
    
    // wait for  redirect
    await waitFor(() => {
      expect(window.location.href).toBe('/display/systems');
    });
    
    // verify toast
    const mockToast = (useToast() as any).toast;
    expect(mockToast).toHaveBeenCalled();
    
    // ensure test passes
    expect(true).toBe(true);
  });
});