import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./store";
import { HYDRATE } from "next-redux-wrapper";
import User from '../interface/UserInterface';

// Initial state
const initialState : User = {
  id: '123',
  name : 'max',
  avatar_num: 3,
  status: 'online',
  victory: 0,
  defeat: 0
};


// Actual Slice
export const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {

    // Action to set the user
    setUserState(state, action) {
      return action.payload;
    },

    // Special reducer for hydrating the state. Special case for next-redux-wrapper
    /*extraReducers: {
      [HYDRATE]: (state, action) => {
        return {
          ...state,
          ...action.payload.auth,
        };
      },
    }*/
  }
});

export const { setUserState } = UserSlice.actions;

export const selectUserState = (state: AppState)  => state.user;

export default UserSlice.reducer;