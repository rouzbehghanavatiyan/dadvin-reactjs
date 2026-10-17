import axios from "axios";

const environment = import.meta.env || {};
const http = axios.create({
  baseURL: environment.VITE_URL || "http://171.22.25.222:9090/",
  timeout: 15000,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});
http.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);
export default http;
