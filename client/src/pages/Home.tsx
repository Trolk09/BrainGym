import { useEffect, useState } from "react";
import { Link } from "wouter";
import { EXERCISES } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Brain, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getExerciseIcon } from "@/lib/icons";

type LeaderboardEntry = {
  id: string;
  username: string;
  points: number;
  exercisesCompleted?: number;
};

function safeParse<T = any>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function Home() {
  const [username, setUsername] = useState<string>(
    localStorage.getItem("brainGymUsername") || ""
  );
  const [showUsernameDialog, setShowUsernameDialog] = useState<boolean>(!username);
  const [tempUsername, setTempUsername] = useState<string>("");
  const [totalPoints, setTotalPoints] = useState<number>(() =>
    Number(localStorage.getItem("totalPoints")) || 0
  );
  const [loadingPoints, setLoadingPoints] = useState<boolean>(true);

  // Utility: load leaderboard from localStorage and update totalPoints for current user
  const loadPointsForUser = (user?: string) => {
    const uname = user ?? username;
    if (!uname) {
      setTotalPoints(0);
      setLoadingPoints(false);
      return;
    }

    const raw = localStorage.getItem("leaderboard");
    const leaderboard = safeParse<LeaderboardEntry[]>(raw, []);
    // normalize entries (ensure points number)
    for (const e of leaderboard) {
      if (typeof e.points !== "number") e.points = Number((e as any).points) || 0;
    }
    const entry = leaderboard.find((e) => e.username === uname);
    setTotalPoints(entry ? entry.points : 0);
    setLoadingPoints(false);
  };

  // On mount / username changes: load points and set up listeners
  useEffect(() => {
    if (!username) {
      setLoadingPoints(false);
      return;
    }

    setLoadingPoints(true);
    loadPointsForUser(username);

    // storage event for cross-tab updates
    const onStorage = (e: StorageEvent) => {
      if (e.key === "leaderboard" || e.key === "lastPointsUpdate" || e.key === "totalPoints") {
        loadPointsForUser(username);
      }
    };
    window.addEventListener("storage", onStorage);

    // In-tab fallback: poll for lastPointsUpdate to detect Exercise writes
    let pollInterval: number | undefined;
    const lastKey = localStorage.getItem("lastPointsUpdate");
    pollInterval = window.setInterval(() => {
      const last = localStorage.getItem("lastPointsUpdate");
      if (last !== lastKey) {
        // reload if timestamp changed
        loadPointsForUser(username);
      }
    }, 1500);

    return () => {
      window.removeEventListener("storage", onStorage);
      if (pollInterval) clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // Helper: persist leaderboard (keeps array sorted descending)
  const saveLeaderboard = (leaderboard: LeaderboardEntry[]) => {
    leaderboard.sort((a, b) => b.points - a.points);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  };

  // Called when user fills the dialog and presses Let's Go!
  const handleSetUsername = () => {
    if (!tempUsername.trim()) return;
    const trimmed = tempUsername.trim();

    // Persist username
    localStorage.setItem("brainGymUsername", trimmed);
    setUsername(trimmed);
    setShowUsernameDialog(false);

    // Ensure leaderboard exists and user entry exists (give +1 point on entering name)
    const raw = localStorage.getItem("leaderboard");
    const leaderboard = safeParse<LeaderboardEntry[]>(raw, []);
    let entry = leaderboard.find((e) => e.username === trimmed);
    if (!entry) {
      entry = {
        id: (crypto && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random()}`),
        username: trimmed,
        points: 1, // +1 point on entering name
        exercisesCompleted: 0,
      };
      leaderboard.push(entry);
    } else {
      // If exists, ensure at least +1 on first time? we'll give +1 only if their points are 0
      if (!entry.points || entry.points <= 0) {
        entry.points = (entry.points || 0) + 1;
      } else {
        // otherwise you can still give 1 if you want — currently only when new
      }
    }

    saveLeaderboard(leaderboard);

    // Also keep a totalPoints key in sync (convenience)
    const total = leaderboard.find((e) => e.username === trimmed)?.points ?? 0;
    localStorage.setItem("totalPoints", String(total));
    setTotalPoints(total);

    // notify other pieces of app
    localStorage.setItem("lastPointsUpdate", Date.now().toString());
    // trigger storage-like event in same tab
    window.dispatchEvent(new Event("storage"));
  };

  const exercisesList = Object.values(EXERCISES);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <Brain className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Brain Gym</h1>
                <p className="text-sm text-muted-foreground">
                  Hi, {username || "Friend"}!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {username && (
                <Badge
                  variant="secondary"
                  className="text-lg px-4 py-2"
                  data-testid="badge-total-points"
                >
                  {loadingPoints ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span className="text-muted-foreground">Points:</span>
                      <span
                        className="ml-2 font-bold text-foreground"
                        data-testid="text-total-points"
                      >
                        {totalPoints}
                      </span>
                    </>
                  )}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUsernameDialog(true)}
                data-testid="button-change-username"
              >
                Change Name
              </Button>
              <Link href="/leaderboard">
                <Button
                  variant="default"
                  className="gap-2"
                  data-testid="button-leaderboard"
                >
                  <Trophy className="h-5 w-5" />
                  Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-12 flex-grow">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-5xl font-bold text-foreground">
            Choose Your Exercise!
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Pick a fun brain exercise to start developing your amazing mind
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {exercisesList.map((exercise) => {
            const IconComponent = getExerciseIcon(exercise.icon);
            return (
              <Link
                key={exercise.id}
                href={`/exercise/${exercise.id}`}
                data-testid={`link-exercise-${exercise.id}`}
              >
                <Card className="group h-full p-6 transition-all hover-elevate active-elevate-2 cursor-pointer">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 group-hover:scale-110 transition-transform">
                      <IconComponent className="h-12 w-12 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-foreground">
                        {exercise.name}
                      </h3>
                      <p className="text-base text-muted-foreground line-clamp-2">
                        {exercise.description}
                      </p>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="pointer-events-none">
                        Start Exercise
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 bg-card/70 backdrop-blur-sm text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Brain Gym · Built with ❤️ by{" "}
          <span className="font-medium text-foreground">
            Divyam(Team Leader), Prikshit, Rishabh
          </span>
        </p>
      </footer>

      {/* Username Dialog */}
      <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">What's your name?</DialogTitle>
            <DialogDescription className="text-base">
              Enter your name so we can track your awesome progress!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base">
                Your Name
              </Label>
              <Input
                id="username"
                placeholder="Enter your name"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSetUsername();
                }}
                className="text-lg"
                data-testid="input-username"
              />
            </div>
            <Button
              onClick={handleSetUsername}
              className="w-full text-lg"
              size="lg"
              disabled={!tempUsername.trim()}
              data-testid="button-save-username"
            >
              Let's Go!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
