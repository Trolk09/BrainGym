import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { LeaderboardEntry } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  const currentUsername = localStorage.getItem("brainGymUsername") || "";

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-chart-3" />;
      case 2:
        return <Medal className="h-6 w-6 text-muted-foreground" />;
      case 3:
        return <Award className="h-6 w-6 text-chart-4" />;
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
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              asChild
              className="gap-2"
              data-testid="button-back"
            >
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
                Back to Exercises
              </Link>
            </Button>
          </div>
        </div>
      </header>

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
              See who's earning the most points doing brain exercises
            </p>
          </div>

          {isLoading ? (
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
          ) : !leaderboard || leaderboard.length === 0 ? (
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
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = entry.username === currentUsername;
                const isTopThree = rank <= 3;

                return (
                  <Card
                    key={entry.id}
                    className={`p-6 transition-all ${
                      isCurrentUser ? "ring-2 ring-primary bg-primary/5" : ""
                    } ${isTopThree ? "shadow-lg" : ""}`}
                    data-testid={`card-leaderboard-${rank}`}
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
                        <p className="text-sm text-muted-foreground">
                          {entry.exercisesCompleted} exercise{entry.exercisesCompleted !== 1 ? "s" : ""} completed
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={getRankBadgeVariant(rank)}
                          className="text-lg px-4 py-1.5 font-bold"
                        >
                          {entry.totalPoints} pts
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
