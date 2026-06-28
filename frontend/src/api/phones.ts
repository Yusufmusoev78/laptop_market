import apiClient from './client';

export interface Phone {
  id: number;
  owner_id?: number | null;
  brand: string;
  brand_id?: number | null;
  model_name: string;
  cpu: string;
  ram_gb: number;
  storage_gb: number;
  screen_size_inches: number;
  battery_capacity_mah: number;
  color: string;
  price_tjs: number;
  stock_quantity: number;
  warranty_months: number;
  description?: string;
}

export interface PhoneCreateInput {
  brand_id: number;
  model_name: string;
  cpu: string;
  ram_gb: number;
  storage_gb: number;
  screen_size_inches: number;
  battery_capacity_mah: number;
  color: string;
  price_tjs: number;
  stock_quantity: number;
  warranty_months: number;
  description?: string;
}

export interface PhoneUpdateInput {
  brand?: string;
  model_name?: string;
  cpu?: string;
  ram_gb?: number;
  storage_gb?: number;
  screen_size_inches?: number;
  battery_capacity_mah?: number;
  color?: string;
  price_tjs?: number;
  stock_quantity?: number;
  warranty_months?: number;
  description?: string;
}

export const getPhones = async (): Promise<Phone[]> => {
  const response = await apiClient.get('/phones/');
  return response.data;
};

export const getPhoneById = async (id: number): Promise<Phone> => {
  const response = await apiClient.get(`/phones/${id}`);
  return response.data;
};

export const getMyPhones = async (): Promise<Phone[]> => {
  const response = await apiClient.get('/phones/me');
  return response.data;
};

export const createPhone = async (data: PhoneCreateInput): Promise<Phone> => {
  const response = await apiClient.post('/phones/', data);
  return response.data;
};

export const updatePhone = async (id: number, data: Partial<PhoneUpdateInput>): Promise<Phone> => {
  const response = await apiClient.put(`/phones/${id}`, data);
  return response.data;
};

export const deletePhone = async (id: number): Promise<Phone> => {
  const response = await apiClient.delete(`/phones/${id}`);
  return response.data;
};

export const recordPhoneSale = async (phoneId: number, quantity: number): Promise<Phone> => {
  const response = await apiClient.post(`/phones/${phoneId}/sales`, { quantity });
  return response.data;
};
