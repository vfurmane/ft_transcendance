import User from "./UserInterface";

export interface Match {
  id: string;
  score_winner: number;
  score_looser: number;
  looser: User | null;
  winner: User | null;
}

export const initMatch: Match = {
  id: "",
  score_winner: 0,
  score_looser: 0,
  looser: null,
  winner: null,
};
