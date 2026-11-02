import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Policy from "./pages/Policy";
import Profile from "./pages/Profile";
import ProfileLayout from "./layouts/ProfileLayout";
import RequireOtpSession from "./routes/RequireOtpSession";
import Panel from "./pages/Dashboard";
import RequestsPage from "./pages/Requests/page";
import ReceiptsPage from "./pages/Receipts/page";
import ChatPage from "./pages/Chat/page";
import ChatRoomPage from "./pages/Chat/room";
import ChannelsPage from "./pages/Channels/page";
import ChannelRoomPage from "./pages/Channels/room";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProfileLayout />}>
          <Route element={<RequireOtpSession />}>
            <Route path="panel" element={<Panel />} />
            <Route path="requests" element={<RequestsPage />} />
            <Route path="receipts" element={<ReceiptsPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="chat/:lawyerId" element={<ChatRoomPage />} />
            <Route path="channels" element={<ChannelsPage />} />
            <Route path="channels/:channel/:roomId" element={<ChannelRoomPage />} />
          </Route>
          <Route path="profile" element={<Profile />} />
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
