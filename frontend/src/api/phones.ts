import apiClient from './client';

export interface Phone {
  id: number; // 🆔 Unique identifier
  owner_id?: number | null; // 👤 Owner's user ID
  brand: string; // 🏷️ Brand name
  brand_id?: number | null; // 🏢 Brand identifier
  model_name: string; // 📝 Model name
  cpu: string; // ⚙️ Processor type
  ram_gb: number; // 🧠 RAM in GB
  storage_gb: number; // 💾 Storage in GB
  screen_size_inches: number; // 📱 Screen size in inches
  battery_capacity_mah: number; // 🔋 Battery capacity in mAh
  color: string; // 🎨 Color
  price_tjs: number; // 💰 Price in TJS
  stock_quantity: number; // 📦 Available stock
  warranty_months: number; // 🛡️ Warranty duration
  description?: string; // 📄 Product description
}

export interface PhoneCreateInput {
  brand_id: number; // 🏢 Brand identifier
  model_name: string; // 📝 Model name
  cpu: string; // ⚙️ Processor type
  ram_gb: number; // 🧠 RAM in GB
  storage_gb: number; // 💾 Storage in GB
  screen_size_inches: number; // 📱 Screen size in inches
  battery_capacity_mah: number; // 🔋 Battery capacity in mAh
  color: string; // 🎨 Color
  price_tjs: number; // 💰 Price in TJS
  stock_quantity: number; // 📦 Available stock
  warranty_months: number; // 🛡️ Warranty duration
  description?: string; // 📄 Product description
}

export interface PhoneUpdateInput {
  brand?: string; // 🏷️ Brand name
  model_name?: string; // 📝 Model name
  cpu?: string; // ⚙️ Processor type
  ram_gb?: number; // 🧠 RAM in GB
  storage_gb?: number; // 💾 Storage in GB
  screen_size_inches?: number; // 📱 Screen size in inches
  battery_capacity_mah?: number; // 🔋 Battery capacity in mAh
  color?: string; // 🎨 Color
  price_tjs?: number; // 💰 Price in TJS
  stock_quantity?: number; // 📦 Available stock
  warranty_months?: number; // 🛡️ Warranty duration
  description?: string; // 📄 Product description
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

