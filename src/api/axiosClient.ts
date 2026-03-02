import axios from "axios";
import { tokenService } from "../utils/token";
import { authApi } from "./auth.api";


export const axiosRefresh = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

//
// ✅ REQUEST INTERCEPTOR (CHỈ 1 CÁI)
//
axiosClient.interceptors.request.use((config) => {
  const token = tokenService.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//
// ✅ RESPONSE INTERCEPTOR (CHỈ 1 CÁI)
//
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const refreshToken = tokenService.getRefreshToken();
    const currentPath = window.location.pathname;

    const isLoginPage = currentPath === "/login";
    const isLoginRequest = originalRequest?.url?.includes("/login");

    if (
      status === 401 &&
      !originalRequest._retry &&
      !isLoginPage &&
      !isLoginRequest &&
      refreshToken
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await authApi.refreshToken();
        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        tokenService.setTokens(newAccessToken, newRefreshToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        tokenService.clearTokens();

        if (!isLoginPage) {
          window.location.href = "/login";
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;