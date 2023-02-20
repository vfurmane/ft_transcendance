import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { UserSlice } from "./UserSlice";
import { createWrapper } from "next-redux-wrapper";
import { ConversationSlice } from "./ConversationSlice";
import { MatchmakingSlice } from "./MatchmakingSlice";
import { BlockedUsersSlice } from "./BlockedUsersSlice";
import { InvitationSlice } from "./InvitationSlice";

const makeStore = () =>
  configureStore({
    reducer: {
      [InvitationSlice.name]: InvitationSlice.reducer,
      [UserSlice.name]: UserSlice.reducer,
      [ConversationSlice.name]: ConversationSlice.reducer,
      [MatchmakingSlice.name]: MatchmakingSlice.reducer,
      [BlockedUsersSlice.name]: BlockedUsersSlice.reducer,
    },
    devTools: true,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const wrapper = createWrapper<AppStore>(makeStore);
