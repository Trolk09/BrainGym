import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface LeaderboardEntry {
  username: string;
  points: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUsername = localStorage.getItem("brainGymUsername") || "";

  // 🧠 Load leaderboard from localStorage
  const loadLeaderboard = () => {
    const stored = localStorage.getItem("leaderboard");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLeaderboard(parsed);
      } catch {
        setLeaderboard([]);
      }
    } else {
      setLeaderboard([]);
    }
    setLoading(false);
  };

  // 🔄 Auto-update when points change (triggered by Exercise)
  useEffect(() => {
    loadLeaderboard();

    const listener = () => loadLeaderboard();

    // React to `storage` events across tabs
    window.addEventListener("storage", listener);

    // React to in-tab updates
    const interval = setInterval(() => {
      const lastUpdate = localStorage.getItem("lastPointsUpdate");
      if (lastUpdate) loadLeaderboard();
    }, 2000);

    return () => {
      window.removeEventListener("storage", listener);
      clearInterval(interval);
    };
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-700" />;
      default:
        return null;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default";
      case 2:
        return "secondary";
      case 3:
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="gap-2">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
                Back to Exercises
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-foreground">
              Top Brain Champions!
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              See who’s earning the most points doing brain exercises
            </p>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </Card>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <Card className="p-12 text-center">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">
                No one on the leaderboard yet!
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Be the first to complete an exercise and earn points!
              </p>
              <Button asChild size="lg">
                <Link href="/">Start an Exercise</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {leaderboard
                .sort((a, b) => b.points - a.points)
                .map((entry, index) => {
                  const rank = index + 1;
                  const isCurrentUser = entry.username === currentUsername;
                  const isTopThree = rank <= 3;

                  return (
                    <Card
                      key={`${entry.username}-${rank}`}
                      className={`p-6 transition-all ${
                        isCurrentUser ? "ring-2 ring-primary bg-primary/5" : ""
                      } ${isTopThree ? "shadow-lg" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                          {getRankIcon(rank) || (
                            <span className="text-lg font-bold text-foreground">
                              #{rank}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-foreground truncate">
                              {entry.username}
                            </h3>
                            {isCurrentUser && (
                              <Badge variant="default" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant={getRankBadgeVariant(rank)}
                            className="text-lg px-4 py-1.5 font-bold"
                          >
                            {entry.points} pts
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
