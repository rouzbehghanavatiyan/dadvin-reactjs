import { createSlice } from "@reduxjs/toolkit";

const mainSlice = createSlice({
  name: "main",
  initialState: { selectedRole: "client" },
  reducers: {
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
  },
});
export const { setSelectedRole } = mainSlice.actions;
export default mainSlice.reducer;
