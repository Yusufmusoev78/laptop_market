import apiClient from './client';

export interface Laptop {
  id: number; // [icon-id] Unique identifier
  owner_id?: number | null; // [icon-user] Owner's user ID
  brand: string; // [icon-tag] Brand name
  brand_id?: number | null; // [icon-building] Brand identifier
  model_name: string; // [icon-edit] Model name
  cpu: string; // [icon-cpu] Processor type
  ram_gb: number; // [icon-memory] RAM in GB
  storage_gb: number; // [icon-database] Storage in GB
  gpu?: string; // [icon-gpu] Graphics processor
  price_tjs: number; // [icon-dollar] Price in TJS
  stock_quantity: number; // [icon-box] Available stock
  keyboard_layout: string; // [icon-keyboard] Keyboard layout
  warranty_months: number; // [icon-shield] Warranty duration
  description?: string; // [icon-file-text] Product description
}

export interface LaptopCreateInput {
  brand_id: number; // [icon-building] Brand identifier
  model_name: string; // [icon-edit] Model name
  cpu: string; // [icon-cpu] Processor type
  ram_gb: number; // [icon-memory] RAM in GB
  storage_gb: number; // [icon-database] Storage in GB
  gpu?: string; // [icon-gpu] Graphics processor
  price_tjs: number; // [icon-dollar] Price in TJS
  stock_quantity: number; // [icon-box] Available stock
  keyboard_layout: string; // [icon-keyboard] Keyboard layout
  warranty_months: number; // [icon-shield] Warranty duration
  description?: string; // [icon-file-text] Product description
}

export interface LaptopUpdateInput {
  brand?: string; // [icon-tag] Brand name
  model_name?: string; // [icon-edit] Model name
  cpu?: string; // [icon-cpu] Processor type
  ram_gb?: number; // [icon-memory] RAM in GB
  storage_gb?: number; // [icon-database] Storage in GB
  gpu?: string; // [icon-gpu] Graphics processor
  price_tjs?: number; // [icon-dollar] Price in TJS
  stock_quantity?: number; // [icon-box] Available stock
  keyboard_layout?: string; // [icon-keyboard] Keyboard layout
  warranty_months?: number; // [icon-shield] Warranty duration
  description?: string; // [icon-file-text] Product description
}

export const getLaptops = async (): Promise<Laptop[]> => {
  const response = await apiClient.get('/laptops/');
  return response.data;
};

export const getLaptopById = async (id: number): Promise<Laptop> => {
  const response = await apiClient.get(`/laptops/${id}`);
  return response.data;
};

export const getMyLaptops = async (): Promise<Laptop[]> => {
  const response = await apiClient.get('/laptops/me');
  return response.data;
};

export const createLaptop = async (data: LaptopCreateInput): Promise<Laptop> => {
  const response = await apiClient.post('/laptops/', data);
  return response.data;
};

export const updateLaptop = async (id: number, data: Partial<LaptopUpdateInput>): Promise<Laptop> => {
  const response = await apiClient.put(`/laptops/${id}`, data);
  return response.data;
};

export const deleteLaptop = async (id: number): Promise<Laptop> => {
  const response = await apiClient.delete(`/laptops/${id}`);
  return response.data;
};

export const recordSale = async (laptopId: number, quantity: number): Promise<Laptop> => {
  const response = await apiClient.post(`/laptops/${laptopId}/sales`, { quantity });
  return response.data;
};

