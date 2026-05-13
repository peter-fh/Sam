import axios, { AxiosInstance, AxiosError } from "axios";
import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

interface UseApiReturn {
  client: AxiosInstance;
  get: <T = unknown>(url: string) => Promise<{ data: T }>;
  post: <T = unknown>(url: string, data?: unknown) => Promise<{ data: T }>;
  put: <T = unknown>(url: string, data?: unknown) => Promise<{ data: T }>;
  delete: <T = unknown>(url: string) => Promise<{ data: T }>;
}

export function useApi(): UseApiReturn {
  const [client, setClient] = useState<AxiosInstance | null>(null);

  useEffect(() => {
    const instance = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add interceptor to include auth token
    instance.interceptors.request.use((config) => {
      const token = sessionStorage.getItem("entra_id_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    // Add interceptor to handle 401 responses
    instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear tokens and redirect to login
          sessionStorage.removeItem("entra_id_token");
          window.location.href = "/";
        }
        return Promise.reject(error);
      }
    );

    setClient(instance);
  }, []);

  const apiClient = client || axios.create({ baseURL: BASE_URL });

  return {
    client: apiClient,
    get: (url: string) => apiClient.get(url),
    post: (url: string, data?: unknown) => apiClient.post(url, data),
    put: (url: string, data?: unknown) => apiClient.put(url, data),
    delete: (url: string) => apiClient.delete(url),
  };
}
