import { useQuery } from "@tanstack/react-query";
import type { LeaderboardEntry } from "@shared/schema";

export function useUserPoints(username: string | null, enabled: boolean = true) {
  return useQuery<LeaderboardEntry[], Error, number>({
    queryKey: ["/api/leaderboard"],
    enabled: enabled && !!username,
    refetchInterval: 2000, // Poll every 2 seconds to get auto-awarded points
    select: (data: LeaderboardEntry[]) => {
      if (!username) return 0;
      const entry = data.find((e) => e.username === username);
      return entry?.totalPoints || 0;
    },
  });
}
