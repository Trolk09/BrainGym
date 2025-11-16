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
  ip?: string;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUsername = localStorage.getItem("brainGymUsername") || "";

  // 🧠 Load leaderboard from BACKEND
  const loadLeaderboard = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error("Leaderboard load error:", err);
      setLeaderboard([]);
    }
    setLoading(false);
  };

  // Load leaderboard on mount + auto refresh
  useEffect(() => {
    loadLeaderboard();

    const interval = setInterval(() => {
      loadLeaderboard();
    }, 4000);

    return () => clearInterval(interval);
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
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              Back to Exercises
            </Link>
          </Button>
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
            <h1 className="text-5xl font-bold text-foreground">Top Brain Champions!</h1>
            <p className="text-xl text-muted-foreground">Global leaderboard (live)</p>
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
              <h3 className="text-2xl font-bold">Leaderboard is empty</h3>
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

                  return (
                    <Card
                      key={entry.username}
                      className={`p-6 transition-all ${
                        isCurrentUser ? "ring-2 ring-primary bg-primary/5" : ""
                      } ${rank <= 3 ? "shadow-lg" : ""}`}
                    >
                      <div className="flex items-center gap-4">

                        {/* Rank Icon */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          {getRankIcon(rank) || (
                            <span className="text-lg font-bold text-foreground">
                              #{rank}
                            </span>
                          )}
                        </div>

                        {/* Username */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold truncate">
                              {entry.username}
                            </h3>
                            {isCurrentUser && (
                              <Badge variant="default" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>

                          {/* IP address (optional) */}
                          {entry.ip && (
                            <p className="text-sm text-muted-foreground">
                              IP: {entry.ip}
                            </p>
                          )}
                        </div>

                        {/* Points */}
                        <Badge
                          variant={getRankBadgeVariant(rank)}
                          className="text-lg px-4 py-1.5 font-bold"
                        >
                          {entry.points} pts
                        </Badge>
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
