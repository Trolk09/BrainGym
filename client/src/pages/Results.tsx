import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Star, Sparkles, Home, RotateCcw } from "lucide-react";
import { EXERCISES } from "@shared/schema";
import { getExerciseIcon } from "@/lib/icons";

export default function Results() {
  const [, params] = useRoute("/results/:exerciseId/:points");
  const [, setLocation] = useLocation();
  
  const exerciseId = params?.exerciseId;
  const points = parseInt(params?.points || "0");
  const exercise = exerciseId ? EXERCISES[exerciseId as keyof typeof EXERCISES] : null;

  useEffect(() => {
    if (!exercise) {
      setLocation("/");
    }
  }, [exercise, setLocation]);

  if (!exercise) {
    return null;
  }

  const ExerciseIcon = getExerciseIcon(exercise.icon);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-12 text-center space-y-8">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <div className="h-32 w-32 rounded-full bg-primary/20" />
            </div>
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-primary">
              <Trophy className="h-20 w-20 text-primary-foreground" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-foreground">
            Amazing Work!
          </h1>
          <p className="text-2xl text-muted-foreground">
            You completed the {exercise.name} exercise
          </p>
        </div>

        <div className="py-8">
          <div className="inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4">
            <Star className="h-8 w-8 text-accent-foreground" />
            <span className="text-4xl font-bold text-accent-foreground" data-testid="text-points-earned">
              +{points} Points!
            </span>
            <Sparkles className="h-8 w-8 text-accent-foreground" />
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <p className="text-lg text-muted-foreground">
            Keep up the great work! Your brain is getting stronger every day.
          </p>
          <div className="flex items-center justify-center gap-2 text-base text-muted-foreground">
            <ExerciseIcon className="h-5 w-5" />
            <span>{exercise.benefits}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-center">
          <Button
            size="lg"
            onClick={() => setLocation(`/exercise/${exercise.id}`)}
            className="gap-2 text-lg px-8"
            data-testid="button-try-again"
          >
            <RotateCcw className="h-5 w-5" />
            Try Again
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setLocation("/")}
            className="gap-2 text-lg px-8"
            data-testid="button-home"
          >
            <Home className="h-5 w-5" />
            Choose Another Exercise
          </Button>
        </div>

        <div className="pt-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/leaderboard")}
            className="gap-2"
            data-testid="button-view-leaderboard"
          >
            <Trophy className="h-5 w-5" />
            View Leaderboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
