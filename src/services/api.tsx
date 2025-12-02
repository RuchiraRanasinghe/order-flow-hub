// src/services/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3030/api';

interface RequestOptions extends RequestInit {
  body?: any;
  token?: string;
}

async function request(endpoint: string, options: RequestOptions = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
  };

  const res = await fetch(`${API_BASE}/${endpoint}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'API request failed');
  }

  return res.json();
}

export default request;
