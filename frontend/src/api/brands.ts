import apiClient from './client';

export interface Brand {
  id: number;
  owner_id: number;
  name: string;
  contact_phone: string;
  support_email: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface BrandCreateInput {
  name: string;
  contact_phone: string;
  support_email: string;
  description?: string;
}

export const createBrand = async (data: BrandCreateInput): Promise<Brand> => {
  const response = await apiClient.post('/brands/', data);
  return response.data;
};

export const getMyBrands = async (): Promise<Brand[]> => {
  const response = await apiClient.get('/brands/me');
  return response.data;
};
