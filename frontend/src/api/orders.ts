import apiClient from './client';
import { Laptop } from './laptops';
import { Phone } from './phones';
import { User } from './auth';

export interface Order {
  id: number;
  user_id: number;
  laptop_id?: number | null;
  phone_id?: number | null;
  quantity: number;
  total_price: number;
  payment_method: string;
  installment_months: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  laptop?: Laptop;
  phone?: Phone;
  user?: User;
}

export interface OrderCreateInput {
  laptop_id?: number;
  phone_id?: number;
  quantity: number;
  payment_method: string;
  installment_months?: number;
}

export const createOrder = async (input: OrderCreateInput): Promise<Order> => {
  const response = await apiClient.post<Order>('/orders/', input);
  return response.data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get<Order[]>('/orders/me');
  return response.data;
};

export const getAllOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get<Order[]>('/orders/');
  return response.data;
};

export const updateOrderStatus = async (orderId: number, status: string): Promise<Order> => {
  const response = await apiClient.patch<Order>(`/orders/${orderId}`, { status });
  return response.data;
};
