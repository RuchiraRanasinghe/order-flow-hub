// src/services/courierService.ts
import request from './api';

export const getCourierOrders = async (token: string) => {
  return request('courier/orders', { method: 'GET', token });
};

export const updateCourierStatus = async (id: string, status: string, token: string) => {
  return request(`courier/${id}/status`, { method: 'PUT', body: { status }, token });
};
