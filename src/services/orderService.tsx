// src/services/orderService.ts
import request from './api';

export const getOrders = async () => {
  return request('orders', { method: 'GET' });
};

export const getOrderById = async (id: string, token: string) => {
  return request(`orders/${id}`, { method: 'GET', token });
};

export const createOrder = async (data: any) => {
  return request('orders', { method: 'POST', body: data });
};

export const updateOrderStatus = async (id: string, status: string, token?: string) => {
  return request(`orders/${id}/status`, { method: 'PUT', body: { status }, token });
};
