import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./store";

// Initial state
const initialState: {userId : string, userName: string} = {userId: "", userName: ""};

// Actual Slice
export const ConversationSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    // Action to set the user
    OpenConversation(state, action) {
      state.userId = action.payload.userId;
      state.userName = action. payload.userName;
    },
    ReinitConversations(state)
    {
        state.userId = ""
        state.userName = ""
    }
  },
});

export const { OpenConversation, ReinitConversations } = ConversationSlice.actions;

export const selectConversationsState: (state: AppState) => {userId : string, userName: string} = (state: AppState) => state.conversations;

export default ConversationSlice.reducer;
