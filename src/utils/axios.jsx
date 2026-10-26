import axios from "axios";

const baseURL = import.meta.env?.VITE_URL || "http://171.22.25.222:9090/";

const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      if (status === 403) {
        console.error("دسترسی به این بخش مجاز نیست.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("پاسخی از سرور دریافت نشد (Timeout).");
    }

    return Promise.reject(error);
  },
);

export default http;
