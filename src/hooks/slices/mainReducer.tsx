import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MainState, UserProfile } from "../../types/domain";

const initialState: MainState = {
  selectedRole: "client",
  verifiedMobile: null,
  userProfile: null,
  isLoadingProfile: false,
};

const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    setSelectedRole: (state, action: PayloadAction<string>) => {
      state.selectedRole = action.payload;
    },
    setOtpSession: (
      state,
      action: PayloadAction<{ mobile: string | null; user?: UserProfile | null }>,
    ) => {
      state.verifiedMobile = action.payload.mobile;
      state.userProfile = action.payload.user ?? null;
    },
    clearOtpSession: (state) => {
      state.verifiedMobile = null;
      state.userProfile = null;
      state.selectedRole = "client";
    },
    setUserProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.userProfile = action.payload;
    },
    setLoadingProfile: (state, action: PayloadAction<boolean>) => {
      state.isLoadingProfile = action.payload;
    },
    clearUserProfile: (state) => {
      state.userProfile = null;
    },
  },
});

export const {
  setSelectedRole,
  setOtpSession,
  clearOtpSession,
  setUserProfile,
  setLoadingProfile,
  clearUserProfile,
} = mainSlice.actions;
export default mainSlice.reducer;
