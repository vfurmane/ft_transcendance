import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./store";
import { Userfront } from "types";
import { initUser } from "../initType/UserInit";

// Initial state
const initialState: { user: Userfront } = {
  user: initUser,
};

// Actual Slice
export const InvitationSlice = createSlice({
  name: "invitation",
  initialState,
  reducers: {
    // Action to set the invited user
    setInvitedUser(state, action: { payload: Userfront }) {
      return { user: action.payload };
    },
  },
});

export const { setInvitedUser } = InvitationSlice.actions;

export const selectInvitationState: (state: AppState) => {
  user: Userfront;
} = (state: AppState) => state.invitation;

export default InvitationSlice.reducer;
