import axios from "axios";
import { expireSession, getAccessToken, isUnauthorizedResponse } from "./authSession";

const baseURL = import.meta.env?.VITE_URL || "http://171.22.25.222:9090/";

const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const authAttempts = [
  "/api/Users/login",
  "/api/Users/register",
  "/api/Users/verifyLoginCode",
  "/api/Users/verifySignUpCode",
];

function isAuthAttempt(url: string | undefined) {
  return authAttempts.some((path) => url?.includes(path));
}

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
      !isAuthAttempt(response.config?.url) &&
      isUnauthorizedResponse(response.status, resData)
    ) {
      expireSession();
      return Promise.reject(new Error("Unauthorized"));
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (
        !isAuthAttempt(error.config?.url) &&
        isUnauthorizedResponse(status, data, error.message)
      ) {
        expireSession();
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
