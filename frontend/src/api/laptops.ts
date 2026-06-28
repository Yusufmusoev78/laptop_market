import apiClient from './client';

export interface Laptop {
  id: number;
  owner_id?: number | null;
  brand: string;
  brand_id?: number | null;
  model_name: string;
  cpu: string;
  ram_gb: number;
  storage_gb: number;
  gpu?: string;
  price_tjs: number;
  stock_quantity: number;
  keyboard_layout: string;
  warranty_months: number;
  description?: string;
}

export interface LaptopCreateInput {
  brand_id: number;
  model_name: string;
  cpu: string;
  ram_gb: number;
  storage_gb: number;
  gpu?: string;
  price_tjs: number;
  stock_quantity: number;
  keyboard_layout: string;
  warranty_months: number;
  description?: string;
}

export interface LaptopUpdateInput {
  brand?: string;
  model_name?: string;
  cpu?: string;
  ram_gb?: number;
  storage_gb?: number;
  gpu?: string;
  price_tjs?: number;
  stock_quantity?: number;
  keyboard_layout?: string;
  warranty_months?: number;
  description?: string;
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
