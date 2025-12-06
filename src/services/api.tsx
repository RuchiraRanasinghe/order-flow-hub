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

  const url = `${API_BASE}/${endpoint}`;
  console.log(`API Request: ${options.method || 'GET'} ${url}`, options.body);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: `API request failed with status ${res.status}` };
      }
      console.error('API Error:', res.status, errorData);
      throw new Error(errorData.message || `API request failed with status ${res.status}`);
    }

    const response = await res.json();
    console.log('API Response:', response);
    
    // Extract data from response if it has the standard format
    if (response.success && response.data !== undefined) {
      return response.data;
    }
    
    // Otherwise return the full response
    return response;
  } catch (error: any) {
    console.error('API Request Error:', error);
    throw error;
  }
}

export default request;
