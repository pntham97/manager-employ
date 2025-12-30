import axios from "axios";
import { tokenService } from "../utils/token";
import { authApi } from "./auth.api";

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
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.request.use((config) => {
  const token = tokenService.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
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

        tokenService.setTokens(newAccessToken);

        axiosClient.defaults.headers.Authorization =
          `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        tokenService.clearTokens();

        // 👉 redirect login nếu cần
        window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
// Request interceptor (gắn token)
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// // Response interceptor (handle error chung)
// axiosClient.interceptors.response.use(
//   (response) => response.data,
//   (error) => {
//     if (error.response?.status === 401) {
//       // logout / redirect login
//       localStorage.removeItem("access_token");
//       window.location.href = "/login";
//     }


//     return Promise.reject(error);
//   }
// );

axiosClient.interceptors.response.use(
  // (res) => res,
  // (error) => {
  //   if (error.response?.status === 401) {
  //     localStorage.removeItem("token");
  //     localStorage.removeItem("user");
  //     window.location.href = "/login";
  //   }
  //   return Promise.reject(error);
  // }
);

export default axiosClient;
