import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./store";

// Initial state
const initialState: {conversation_id : string} = {conversation_id: ""};

// Actual Slice
export const ConversationSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    // Action to set the user
    OpenConversation(state, action) {
      state.conversation_id = action.payload;
    },
    ReinitConversations(state)
    {
        state.conversation_id = ""
    }
  },
});

export const { OpenConversation, ReinitConversations } = ConversationSlice.actions;

export const selectConversationsState: (state: AppState) => string = (state: AppState) => state.conversations.conversation_id;

export default ConversationSlice.reducer;
