import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./hooks/store/store";
import App from "./App";
import "./index.css";
import AuthInitializer from "./components/AuthInitializer";

const reloadGuard = "dadvin-reload-once";

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  if (sessionStorage.getItem(reloadGuard) === "1") return;
  sessionStorage.setItem(reloadGuard, "1");
  window.location.reload();
});

window.addEventListener("load", () => {
  sessionStorage.removeItem(reloadGuard);
});

const root = document.getElementById("root");
if (!root) throw new Error("عنصر ریشه پیدا نشد.");

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <AuthInitializer>
        <App />
      </AuthInitializer>
    </Provider>
  </StrictMode>,
);
