import { useState } from "react";
import { Link } from "wouter";
import { EXERCISES, type ExerciseType } from "@shared/schema";
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
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useUserPoints } from "@/hooks/use-user-points";

export default function Home() {
  const [username, setUsername] = useState(
    localStorage.getItem("brainGymUsername") || ""
  );
  const [showUsernameDialog, setShowUsernameDialog] = useState(!username);
  const [tempUsername, setTempUsername] = useState("");
  
  const { data: totalPoints, isLoading: isLoadingPoints } = useUserPoints(username);

  const initializeUserMutation = useMutation({
    mutationFn: async (username: string) => {
      return apiRequest("POST", "/api/leaderboard", { username, pointsToAdd: 1 });
    },
  });

  const handleSetUsername = async () => {
    if (tempUsername.trim()) {
      localStorage.setItem("brainGymUsername", tempUsername.trim());
      setUsername(tempUsername.trim());
      setShowUsernameDialog(false);
      
      // Initialize user on leaderboard to enable auto-rewards
      try {
        await initializeUserMutation.mutateAsync(tempUsername.trim());
      } catch (error) {
        // User might already exist, which is fine
        console.log("User initialization:", error);
      }
    }
  };

  const exercisesList = Object.values(EXERCISES);

  return (
    <div className="min-h-screen bg-background">
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
                <Badge variant="secondary" className="text-lg px-4 py-2" data-testid="badge-total-points">
                  {isLoadingPoints ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span className="text-muted-foreground">Points:</span>
                      <span className="ml-2 font-bold text-foreground" data-testid="text-total-points">
                        {totalPoints || 0}
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

      <main className="container mx-auto px-6 py-12">
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
                  if (e.key === "Enter") {
                    handleSetUsername();
                  }
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
