import apiClient from './client';
import { User } from './auth';

export interface AdminUserUpdateInput {
  is_active?: boolean;
  is_admin?: boolean;
}

export const getAllUsers = async (): Promise<User[]> => {
  const response = await apiClient.get('/admin/users');
  return response.data;
};

export const updateUser = async (id: number, data: AdminUserUpdateInput): Promise<User> => {
  const response = await apiClient.patch(`/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<User> => {
  const response = await apiClient.delete(`/admin/users/${id}`);
  return response.data;
};
