import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./store";
import User, { initUser } from "../interface/UserInterface";

// Initial state
const initialState: User = initUser;

// Actual Slice
export const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Action to set the user
    setUserState(state, action) {
      return action.payload;
    },
  },
});

export const { setUserState } = UserSlice.actions;

export const selectUserState = (state: AppState) => state.user;

export default UserSlice.reducer;
