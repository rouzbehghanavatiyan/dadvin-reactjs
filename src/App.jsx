import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Policy from "./pages/Policy";
import Profile from "./pages/Profile";
import ProfileLayout from "./layouts/ProfileLayout";
import RequireOtpSession from "./routes/RequireOtpSession";
import Panel from "./pages/Dashboard";
import SessionObserver from "./components/auth/SessionObserver";

export default function App() {
  return (
    <BrowserRouter>
      <SessionObserver />
      <Routes>
        <Route element={<ProfileLayout />}>
          <Route element={<RequireOtpSession />}>
            <Route path="panel" element={<Panel />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
        <Route element={<AuthLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="terms" element={<Policy />} />
          <Route path="privacy" element={<Policy privacy />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
