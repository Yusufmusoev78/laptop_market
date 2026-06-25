import apiClient from './client';

export interface Laptop {
  id: number;
  brand: string;
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

export const getLaptops = async (): Promise<Laptop[]> => {
  const response = await apiClient.get('/laptops/');
  return response.data;
};
