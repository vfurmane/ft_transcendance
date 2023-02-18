import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./store";

// Initial state
const initialState: string[] = [];

// Actual Slice
export const BlockedUsersSlice = createSlice({
  name: "blockedUsers",
  initialState,
  reducers: {
    // Action to set the block list
    setBlockedUsers(_, action: { payload: string[] }) {
      return action.payload;
    },
    // Action to add an user to the blocked list
    blockUser(state, action: { payload: string }) {
      if (state.find((userId) => userId === action.payload)) return state;
      return [...state, action.payload];
    },
    // Action to remove an user to the blocked list
    unblockUser(state, action: { payload: string }) {
      const index = state.findIndex((userId) => userId === action.payload);
      if (index >= 0) {
        state.splice(index, 1);
      }
      return state;
    },
  },
});

export const { setBlockedUsers, blockUser, unblockUser } =
  BlockedUsersSlice.actions;

export const selectBlockedUsersState: (state: AppState) => string[] = (
  state: AppState
) => state.blockedUsers;

export default BlockedUsersSlice.reducer;
