import axios from "axios";
import { clearVerifiedSession, getAccessToken } from "./authSession";

const baseURL = import.meta.env?.VITE_URL || "http://171.22.25.222:9090/";

const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const handleUnauthorized = () => {
  clearVerifiedSession();
  delete http.defaults.headers.common.Authorization;
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

http.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      config.headers.delete("Content-Type");
    }
    return config;
  },
  (error) => Promise.reject(error),
);

http.interceptors.response.use(
  (response) => {
    const resData = response?.data;
    if (
      resData?.status === 401 ||
      resData?.statusCode === 401 ||
      resData?.code === 401
    ) {
      handleUnauthorized();
      return Promise.reject(new Error("Unauthorized"));
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (
        status === 401 ||
        data?.status === 401 ||
        data?.statusCode === 401 ||
        data?.code === 401
      ) {
        handleUnauthorized();
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
