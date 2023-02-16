import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./store";
import { GameMode, Matchmaking } from "types";

// Initial state
const initialState: Matchmaking = {
  isInQueue: false,
  gameMode: GameMode.CLASSIC,
};

// Actual Slice
export const MatchmakingSlice = createSlice({
  name: "matchmaking",
  initialState,
  reducers: {
    // Action to set the game mode
    setGameMode(state, action: { payload: GameMode; type: string }) {
      return { ...state, isInQueue: true, gameMode: action.payload };
    },
  },
});

export const { setGameMode } = MatchmakingSlice.actions;

export const selectMatchmakingState: (state: AppState) => Matchmaking = (
  state: AppState
) => state.matchmaking;

export default MatchmakingSlice.reducer;
