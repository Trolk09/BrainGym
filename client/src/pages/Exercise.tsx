import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { EXERCISES, type ExerciseType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera } from "lucide-react";
import { getExerciseIcon } from "@/lib/icons";

type LeaderboardEntry = {
  id: string;
  username: string;
  points: number;
  ip?: string;
  exercisesCompleted?: number;
};

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export default function Exercise() {
  const [, params] = useRoute("/exercise/:exerciseId");
  const [, setLocation] = useLocation();
  const exerciseId = params?.exerciseId as ExerciseType;
  const exercise = EXERCISES[exerciseId];

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState<number>(() => Number(localStorage.getItem("totalPoints")) || 0);
  const [timeLeft, setTimeLeft] = useState(60);

  const pointsIntervalRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const username = localStorage.getItem("brainGymUsername") || "";

  // redirect if no username
  useEffect(() => {
    if (!username) setLocation("/");
  }, [username, setLocation]);

  // camera init
  useEffect(() => {
    if (!exercise) {
      setLocation("/");
      return;
    }

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 1280, height: 720 },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch (error) {
        console.error("Camera error:", error);
      }
    };

    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise]);

  // awarding random points every 15s while capturing
  useEffect(() => {
    if (!isCapturing) {
      if (pointsIntervalRef.current) {
        clearInterval(pointsIntervalRef.current);
        pointsIntervalRef.current = null;
      }
      return;
    }
    if (pointsIntervalRef.current) return;

    pointsIntervalRef.current = window.setInterval(() => {
      const randomPoints = Math.floor(Math.random() * (79 - 40 + 1)) + 40; // 40-79 as requested

      // session
      setSessionPoints((prev) => prev + randomPoints);

      // update leaderboard in localStorage
      const board = safeParse<LeaderboardEntry[]>(localStorage.getItem("leaderboard"), []);
      const entry = board.find((e) => e.username === username);
      const userIp = localStorage.getItem("userIp") || "Unknown";
      if (entry) {
        entry.points = (entry.points || 0) + randomPoints;
        entry.ip = userIp;
        entry.exercisesCompleted = (entry.exercisesCompleted || 0) + 1;
      } else {
        board.push({
          id: (crypto && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random()}`),
          username,
          points: randomPoints,
          ip: userIp,
          exercisesCompleted: 1,
        });
      }
      board.sort((a, b) => b.points - a.points);
      localStorage.setItem("leaderboard", JSON.stringify(board));
      localStorage.setItem("totalPoints", String(board.find((e) => e.username === username)?.points ?? 0));
      localStorage.setItem("lastPointsUpdate", Date.now().toString());
      // signal other parts of app
      window.dispatchEvent(new Event("storage"));
      // update local totalPoints
      setTotalPoints((prev) => prev + randomPoints);
    }, 15000);

    return () => {
      if (pointsIntervalRef.current) {
        clearInterval(pointsIntervalRef.current);
        pointsIntervalRef.current = null;
      }
    };
  }, [isCapturing, username]);

  // timer
  useEffect(() => {
    if (!isCapturing || timeLeft <= 0) return;
    const t = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleStopCapture();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isCapturing, timeLeft]);

  // auto-sync totalPoints (reflect admin changes)
  useEffect(() => {
    const interval = window.setInterval(() => {
      const board = safeParse<LeaderboardEntry[]>(localStorage.getItem("leaderboard"), []);
      const entry = board.find((e) => e.username === username);
      const newPoints = entry ? entry.points : 0;
      if (newPoints !== totalPoints) {
        setTotalPoints(newPoints);
        localStorage.setItem("totalPoints", String(newPoints));
      }
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, totalPoints]);

  const handleStartCapture = () => {
    setIsCapturing(true);
    setTimeLeft(60);
    setSessionPoints(0);
  };

  const handleStopCapture = () => {
    setIsCapturing(false);
    if (pointsIntervalRef.current) {
      clearInterval(pointsIntervalRef.current);
      pointsIntervalRef.current = null;
    }
  };

  const handleFinishExercise = () => {
    // finishing: stop capturing, persist last state already saved by interval
    setIsCapturing(false);
    setSessionPoints(0);
    setTimeLeft(60);
    if (pointsIntervalRef.current) {
      clearInterval(pointsIntervalRef.current);
      pointsIntervalRef.current = null;
    }
    // navigate home
    setLocation("/");
  };

  if (!exercise) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2">
              <ArrowLeft className="h-5 w-5" />
              Back to Exercises
            </Button>

            <div className="flex items-center gap-4">
              {isCapturing && (
                <Badge variant={timeLeft <= 10 ? "destructive" : "default"} className="text-2xl px-6 py-3 font-bold">
                  ⏱️ {timeLeft}s
                </Badge>
              )}
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <span className="text-muted-foreground">Points:</span>
                <span className="ml-2 font-bold text-foreground">{totalPoints}</span>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* main */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-3 space-y-6">
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-video">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {!stream && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
                  <p className="text-lg text-muted-foreground mt-4">Starting camera...</p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              {!isCapturing ? (
                <>
                  <Button size="lg" onClick={handleStartCapture} disabled={!stream} className="text-lg px-8 gap-2">
                    <Camera className="h-5 w-5" /> Start Exercise
                  </Button>

                  {sessionPoints > 0 && (
                    <Button size="lg" variant="outline" onClick={handleFinishExercise} className="text-lg px-8">
                      Finish Exercise
                    </Button>
                  )}
                </>
              ) : (
                <Button size="lg" variant="destructive" onClick={handleStopCapture} className="text-lg px-8">
                  Stop Exercise
                </Button>
              )}
            </div>

            {sessionPoints > 0 && (
              <Card className="p-4 text-center bg-primary/10 border-primary/20">
                <p className="text-lg font-semibold text-foreground">
                  You’ve earned <span className="text-primary font-bold">{sessionPoints}</span> points this session!
                </p>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  {(() => {
                    const IconComponent = getExerciseIcon(exercise.icon);
                    return <IconComponent className="h-7 w-7 text-primary" />;
                  })()}
                </div>
                <h2 className="text-3xl font-bold">{exercise.name}</h2>
              </div>
              <p className="text-base text-muted-foreground mt-4">{exercise.benefits}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">How to do it:</h3>
              <ol className="space-y-3">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{index + 1}</span>
                    <span className="text-base">{instruction}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="p-6 bg-accent/10 border-accent/20">
              <h3 className="text-lg font-bold mb-3">💡 Tip</h3>
              <p className="text-base text-muted-foreground">Make sure you're in a well-lit area and visible to the camera.</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
