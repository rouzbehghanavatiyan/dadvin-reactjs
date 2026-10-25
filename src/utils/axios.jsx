import axios from "axios";
import { getAccessToken, expireVerifiedSession } from "./authSession";

const environment = import.meta.env || {};
const http = axios.create({
  baseURL: environment.VITE_URL || "http://171.22.25.222:9090/",
  timeout: 15000,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});
const publicAuthPaths = new Set([
  "/api/Users/login",
  "/api/Users/register",
  "/api/Users/verifyLoginCode",
  "/api/Users/verifySignUpCode",
]);

http.interceptors.request.use((config) => {
  const base = new URL(config.baseURL || http.defaults.baseURL);
  const target = new URL(config.url || "", base);
  const sameOrigin = target.origin === base.origin;
  const publicAuth = publicAuthPaths.has(target.pathname.replace(/\/$/, ""));
  const explicitToken = config.headers.get("Authorization");
  // Never forward credentials to an absolute URL outside the configured API origin.
  if (!sameOrigin || publicAuth) {
    config.headers.delete("Authorization");
    if (!sameOrigin && config.authRequired)
      throw new Error("ارسال توکن به آدرسی خارج از سرور API مجاز نیست.");
    return config;
  }
  const token = explicitToken || (getAccessToken() ? `Bearer ${getAccessToken()}` : null);
  if (config.authRequired && !token)
    throw new Error("برای ادامه، دوباره وارد حساب خود شوید.");
  if (token) config.headers.set("Authorization", token);
  return config;
});
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const authorization = error.config?.headers?.get?.("Authorization");
    if (error.response?.status === 401 && authorization?.startsWith("Bearer ")) {
      if (expireVerifiedSession(authorization.slice(7))) error.sessionExpired = true;
    }
    return Promise.reject(error);
  },
);
export default http;
