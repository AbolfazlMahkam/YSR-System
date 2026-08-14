import axios from "axios";
import localStorageService from "./localStorageService";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const HttpClient = axios.create({
  baseURL,
  timeout: 0,
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
    Accept: "application/json",
  },
});

HttpClient.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    config.headers["authorization"] =
      `Bearer ${localStorageService.getToken()}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue = [];

function processQueue(error) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
}

function clearSessionAndRedirect() {
  localStorageService.clearSession();
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

async function refreshAccessToken() {
  const refreshToken = localStorageService.getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  // Use a bare axios call so this request never hits the auth interceptors.
  const response = await axios.post(`${baseURL}/auth/refresh`, {
    refresh_token: refreshToken,
  });

  const { access_token, refresh_token } = response.data || {};
  if (!access_token || !refresh_token) {
    throw new Error("Refresh response is missing tokens");
  }

  localStorageService.setSession(access_token, refresh_token);
  return access_token;
}

HttpClient.interceptors.response.use(
  (response) => response.data || null,
  async (error) => {
    if (error.code === "ERR_NETWORK") {
      window.location.href = "#/internet";
    }

    const status = error.response?.status;
    const originalRequest = error.config;

    if (
      status === 403 &&
      typeof error.response.data?.message === "string" &&
      error.response.data.message.includes("does not meet the requirements")
    ) {
      window.location.reload();
      return Promise.reject(error);
    }

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          originalRequest.headers["authorization"] =
            `Bearer ${localStorageService.getToken()}`;
          return HttpClient(originalRequest);
        })
        .catch(() => Promise.reject(error));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await refreshAccessToken();
      processQueue(null);
      originalRequest.headers["authorization"] =
        `Bearer ${localStorageService.getToken()}`;
      return HttpClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default HttpClient;
