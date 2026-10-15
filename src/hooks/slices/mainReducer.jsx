import { createSlice } from "@reduxjs/toolkit";

const mainSlice = createSlice({
  name: "main",
  initialState: { selectedRole: "client", verifiedMobile: null },
  reducers: {
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
    setOtpSession: (state, action) => {
      state.verifiedMobile = action.payload;
    },
    clearOtpSession: (state) => {
      state.verifiedMobile = null;
      state.selectedRole = "client";
    },
  },
});
export const { setSelectedRole, setOtpSession, clearOtpSession } =
  mainSlice.actions;
export default mainSlice.reducer;
