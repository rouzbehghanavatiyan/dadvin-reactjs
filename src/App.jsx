import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Policy from "./pages/Policy";
import Profile from "./pages/Profile";
import ProfileLayout from "./layouts/ProfileLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProfileLayout />}>
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="terms" element={<Policy />} />
          <Route path="privacy" element={<Policy privacy />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
