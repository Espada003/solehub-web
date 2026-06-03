import { apiRequest } from './api';
import { tokenStore } from './token-store';
import type { AuthTokens, User } from './types';

export const auth = {
  async login(email: string, password: string): Promise<AuthTokens> {
    const tokens = await apiRequest<AuthTokens>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    tokenStore.set(tokens.accessToken, tokens.refreshToken, tokens.user);
    return tokens;
  },

  async register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<User> {
    return apiRequest<User>('/auth/register', { method: 'POST', body: input, auth: false });
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // ignore — best-effort revoke
    }
    tokenStore.clear();
  },

  async me(): Promise<User> {
    return apiRequest<User>('/me');
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiRequest('/auth/change-password', { method: 'POST', body: { oldPassword, newPassword } });
  },
};
