import apiClient from './client';

export interface Laptop {
  id: number; // 🆔 Unique identifier
  owner_id?: number | null; // 👤 Owner's user ID
  brand: string; // 🏷️ Brand name
  brand_id?: number | null; // 🏢 Brand identifier
  model_name: string; // 📝 Model name
  cpu: string; // ⚙️ Processor type
  ram_gb: number; // 🧠 RAM in GB
  storage_gb: number; // 💾 Storage in GB
  gpu?: string; // 🎮 Graphics processor
  price_tjs: number; // 💰 Price in TJS
  stock_quantity: number; // 📦 Available stock
  keyboard_layout: string; // ⌨️ Keyboard layout
  warranty_months: number; // 🛡️ Warranty duration
  description?: string; // 📄 Product description
}

export interface LaptopCreateInput {
  brand_id: number; // 🏢 Brand identifier
  model_name: string; // 📝 Model name
  cpu: string; // ⚙️ Processor type
  ram_gb: number; // 🧠 RAM in GB
  storage_gb: number; // 💾 Storage in GB
  gpu?: string; // 🎮 Graphics processor
  price_tjs: number; // 💰 Price in TJS
  stock_quantity: number; // 📦 Available stock
  keyboard_layout: string; // ⌨️ Keyboard layout
  warranty_months: number; // 🛡️ Warranty duration
  description?: string; // 📄 Product description
}

export interface LaptopUpdateInput {
  brand?: string; // 🏷️ Brand name
  model_name?: string; // 📝 Model name
  cpu?: string; // ⚙️ Processor type
  ram_gb?: number; // 🧠 RAM in GB
  storage_gb?: number; // 💾 Storage in GB
  gpu?: string; // 🎮 Graphics processor
  price_tjs?: number; // 💰 Price in TJS
  stock_quantity?: number; // 📦 Available stock
  keyboard_layout?: string; // ⌨️ Keyboard layout
  warranty_months?: number; // 🛡️ Warranty duration
  description?: string; // 📄 Product description
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

