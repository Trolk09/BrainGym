import { useEffect, useState } from "react";
import { Link } from "wouter";
import { EXERCISES } from "@shared/schema";
import { memoryStore } from "@/lib/memoryStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { getExerciseIcon } from "@/lib/icons";

export default function Home() {
  const [showDialog, setShowDialog] = useState(memoryStore.username === "");
  const [tempUsername, setTempUsername] = useState("");
  const [totalPoints, setTotalPoints] = useState(memoryStore.totalPoints);

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalPoints(memoryStore.totalPoints);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const saveUsername = () => {
    if (!tempUsername.trim()) return;
    memoryStore.username = tempUsername.trim();

    if (
      !memoryStore.leaderboard.find(
        (u) => u.username === memoryStore.username
      )
    ) {
      memoryStore.leaderboard.push({
        username: memoryStore.username,
        points: 0,
      });
    }

    setShowDialog(false);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 bg-card/90 border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
            <Brain className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Brain Gym</h1>
        </div>

        {memoryStore.username && (
          <Badge className="text-lg px-4 py-2">Points: {totalPoints}</Badge>
        )}

        <Button onClick={() => setShowDialog(true)}>Change Name</Button>
        <Link href="/leaderboard">
          <Button>Leaderboard</Button>
        </Link>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(EXERCISES).map((exercise) => {
            const Icon = getExerciseIcon(exercise.icon);
            return (
              <Link href={`/exercise/${exercise.id}`} key={exercise.id}>
                <Card className="p-6 text-center hover:scale-105 transition cursor-pointer">
                  <div className="h-20 w-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mt-4">{exercise.name}</h3>
                  <p className="text-muted-foreground">
                    {exercise.description}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Name</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter your name"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
          />
          <Button onClick={saveUsername} className="w-full mt-4">
            Save
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
