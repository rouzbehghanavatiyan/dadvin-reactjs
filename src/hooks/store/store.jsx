import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "../slices/mainReducer";

export const store = configureStore({ reducer: { main: mainReducer } });
