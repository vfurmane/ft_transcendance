import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./store";
import { Userfront as User } from "types";
import { initUser } from "../initType/UserInit";

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
    toggleTfa(state) {
      state.tfaSetup = !state.tfaSetup;
    },
  },
});

export const { setUserState, toggleTfa } = UserSlice.actions;

export const selectUserState: (state: AppState) => User = (state: AppState) =>
  state.user;

export default UserSlice.reducer;
