import apiClient from './client';

export interface User {
  id: number;
  email: string;
  username?: string | null;
  phone?: string | null;
  address?: string | null;
  role: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignupInput {
  email: string;
  username: string;
  phone: string;
  address: string;
  password: string;
  role?: string;
}

export interface ProfileUpdateInput {
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
  role?: string;
}

export interface UsernameAvailability {
  available: boolean;
  suggestions: string[];
}

export const signup = async (data: SignupInput): Promise<User> => {
  const response = await apiClient.post('/users/', data);
  return response.data;
};

export const checkUsername = async (username: string): Promise<UsernameAvailability> => {
  const response = await apiClient.get('/users/check-username', { params: { username } });
  return response.data;
};

export const updateProfile = async (data: ProfileUpdateInput): Promise<User> => {
  const response = await apiClient.patch('/users/me', data);
  return response.data;
};

export const login = async (email: string, password: string): Promise<string> => {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);
  const response = await apiClient.post('/users/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data.access_token;
};

export const loginGoogle = async (idToken: string): Promise<string> => {
  const response = await apiClient.post('/users/login/google', { id_token: idToken });
  return response.data.access_token;
};

export const getMe = async (): Promise<User> => {
  const response = await apiClient.get('/users/me');
  return response.data;
};
