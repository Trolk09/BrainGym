import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";
import { memoryStore } from "@/lib/memoryStore";
import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState(memoryStore.leaderboard);
  const currentUsername = memoryStore.username;

  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard([...memoryStore.leaderboard]);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-700" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 border-b bg-card/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" /> Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold text-center">Leaderboard</h1>

          {leaderboard.length === 0 ? (
            <Card className="p-12 text-center">
              <h3 className="text-2xl font-bold">No users yet</h3>
            </Card>
          ) : (
            leaderboard
              .sort((a, b) => b.points - a.points)
              .map((entry, index) => {
                const rank = index + 1;
                return (
                  <Card key={entry.username} className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        {getRankIcon(rank) || (
                          <span className="font-bold">#{rank}</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{entry.username}</h3>
                      </div>

                      <Badge className="text-lg px-4 py-1.5">
                        {entry.points} pts
                      </Badge>
                    </div>
                  </Card>
                );
              })
          )}
        </div>
      </main>
    </div>
  );
}
