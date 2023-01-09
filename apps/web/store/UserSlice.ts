import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./store";
import { HYDRATE } from "next-redux-wrapper";
import User from '../interface/UserInterface';

// Initial state
const initialState : User = {
  id: '123',
  name : 'max',
  avatar_num: 3,
  status: 'online'
};


// Actual Slice
export const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {

    // Action to set the authentication status
    setUserState(state, action) {
      state = action.payload;
    }
  },
});

export const { setUserState } = UserSlice.actions;

export const selectUserState = (state: AppState)  => state.user;

export default UserSlice.reducer;