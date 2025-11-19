import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { EXERCISES } from "@shared/schema";
import { memoryStore } from "@/lib/memoryStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { getExerciseIcon } from "@/lib/icons";

export default function Exercise() {
  const [, params] = useRoute("/exercise/:id");
  const [, setLocation] = useLocation();
  const id = params?.id;
  const exercise = EXERCISES[id];

  const [sessionPoints, setSessionPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [capturing, setCapturing] = useState(false);

  if (!exercise) return null;

  const givePoints = () => {
    const pts = Math.floor(Math.random() * 40) + 40;
    setSessionPoints((p) => p + pts);
    memoryStore.totalPoints += pts;

    const user = memoryStore.leaderboard.find(
      (u) => u.username === memoryStore.username
    );
    if (user) user.points += pts;
  };

  useEffect(() => {
    if (!capturing) return;

    const interval = setInterval(() => {
      givePoints();
    }, 15000);

    return () => clearInterval(interval);
  }, [capturing]);

  useEffect(() => {
    if (!capturing) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setCapturing(false);
          return 60;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [capturing]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 border-b bg-card/95 backdrop-blur px-6 py-4">
        <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2">
          <ArrowLeft /> Back
        </Button>

        <Badge className="text-lg px-4 py-2">
          Points: {memoryStore.totalPoints}
        </Badge>
      </header>

      <main className="container mx-auto px-6 py-6">
        <Card className="p-6">
          <h1 className="text-3xl font-bold">{exercise.name}</h1>
          <p className="text-muted-foreground mt-2">{exercise.description}</p>
        </Card>

        <div className="mt-6 flex gap-4">
          {!capturing ? (
            <Button onClick={() => setCapturing(true)} size="lg">
              Start Exercise
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => setCapturing(false)} size="lg">
              Stop
            </Button>
          )}
        </div>

        {capturing && (
          <Card className="p-6 mt-6">
            <p className="text-xl font-bold">⏱ {timeLeft}s left</p>
            {sessionPoints > 0 && (
              <p className="text-lg mt-2">
                Earned this session:{" "}
                <strong className="text-primary">{sessionPoints}</strong>
              </p>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
