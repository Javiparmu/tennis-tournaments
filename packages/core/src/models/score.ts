export type TiebreakScore = {
  player1Points: number;
  player2Points: number;
};

export type SetScore = {
  player1Games: number;
  player2Games: number;
  tiebreak: TiebreakScore | null;
};

export type TennisScore = {
  sets: SetScore[];
};
