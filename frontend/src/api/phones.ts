import apiClient from './client';

export interface Phone {
  id: number; // [icon-id] Unique identifier
  owner_id?: number | null; // [icon-user] Owner's user ID
  brand: string; // [icon-tag] Brand name
  brand_id?: number | null; // [icon-building] Brand identifier
  model_name: string; // [icon-edit] Model name
  cpu: string; // [icon-cpu] Processor type
  ram_gb: number; // [icon-memory] RAM in GB
  storage_gb: number; // [icon-database] Storage in GB
  screen_size_inches: number; // [icon-monitor] Screen size in inches
  battery_capacity_mah: number; // [icon-battery] Battery capacity in mAh
  color: string; // [icon-palette] Color
  price_tjs: number; // [icon-dollar] Price in TJS
  stock_quantity: number; // [icon-box] Available stock
  warranty_months: number; // [icon-shield] Warranty duration
  description?: string; // [icon-file-text] Product description
}

export interface PhoneCreateInput {
  brand_id: number; // [icon-building] Brand identifier
  model_name: string; // [icon-edit] Model name
  cpu: string; // [icon-cpu] Processor type
  ram_gb: number; // [icon-memory] RAM in GB
  storage_gb: number; // [icon-database] Storage in GB
  screen_size_inches: number; // [icon-monitor] Screen size in inches
  battery_capacity_mah: number; // [icon-battery] Battery capacity in mAh
  color: string; // [icon-palette] Color
  price_tjs: number; // [icon-dollar] Price in TJS
  stock_quantity: number; // [icon-box] Available stock
  warranty_months: number; // [icon-shield] Warranty duration
  description?: string; // [icon-file-text] Product description
}

export interface PhoneUpdateInput {
  brand?: string; // [icon-tag] Brand name
  model_name?: string; // [icon-edit] Model name
  cpu?: string; // [icon-cpu] Processor type
  ram_gb?: number; // [icon-memory] RAM in GB
  storage_gb?: number; // [icon-database] Storage in GB
  screen_size_inches?: number; // [icon-monitor] Screen size in inches
  battery_capacity_mah?: number; // [icon-battery] Battery capacity in mAh
  color?: string; // [icon-palette] Color
  price_tjs?: number; // [icon-dollar] Price in TJS
  stock_quantity?: number; // [icon-box] Available stock
  warranty_months?: number; // [icon-shield] Warranty duration
  description?: string; // [icon-file-text] Product description
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

