// GLOBAL in-memory leaderboard for the whole app (resets on reload)
export const memoryStore = {
  leaderboard: [] as {
    username: string;
    points: number;
    ip?: string;
    exercisesCompleted?: number;
  }[],

  username: "",
  userIp: "Unknown",
  totalPoints: 0,
};
