import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { EXERCISES, type ExerciseType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getExerciseIcon } from "@/lib/icons";
import { useUserPoints } from "@/hooks/use-user-points";

export default function Exercise() {
  const [, params] = useRoute("/exercise/:exerciseId");
  const [, setLocation] = useLocation();
  const exerciseId = params?.exerciseId as ExerciseType;
  const exercise = EXERCISES[exerciseId];

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const username = localStorage.getItem("brainGymUsername") || "";

  const { data: totalPoints, isLoading: isLoadingPoints, refetch } = useUserPoints(username);

  // Redirect if no username
  useEffect(() => {
    if (!username) setLocation("/");
  }, [username, setLocation]);

  // Initialize webcam
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
        console.error("Error accessing camera:", error);
      }
    };

    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      stopExercise();
    };
  }, [exercise, setLocation]);

  // Mutation to add points
  const addPointsMutation = useMutation({
    mutationFn: async (pointsToAdd: number) => {
      return apiRequest("POST", "/api/leaderboard", { username, pointsToAdd });
    },
    onSuccess: () => refetch(),
  });

  // Start exercise
  const startExercise = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTimeLeft(60);

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopExercise();
          return 0;
        }

        // Give random points every 15 seconds
        if ((prev - 1) % 15 === 0) {
          const randomPoints = Math.floor(Math.random() * 40) + 40;
          addPointsMutation.mutate(randomPoints);
        }

        return prev - 1;
      });
    }, 1000);

    setIntervalId(id);
  };

  // Stop exercise manually or on timer end
  const stopExercise = () => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    setIsRunning(false);
    refetch(); // update leaderboard
  };

  if (!exercise) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2">
              <ArrowLeft className="h-5 w-5" />
              Back to Exercises
            </Button>
            <div className="flex items-center gap-4">
              {isRunning && (
                <Badge
                  variant={timeLeft <= 10 ? "destructive" : "default"}
                  className="text-2xl px-6 py-3 font-bold"
                >
                  ⏱️ {timeLeft}s
                </Badge>
              )}
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {isLoadingPoints ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span className="text-muted-foreground">Points:</span>
                    <span className="ml-2 font-bold text-foreground">
                      {totalPoints || 0}
                    </span>
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {/* Left Section */}
          <div className="lg:col-span-3 space-y-6">
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!stream && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Camera className="h-16 w-16 text-muted-foreground" />
                  <p className="mt-4 text-lg text-muted-foreground">Starting camera...</p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              {!isRunning ? (
                <Button
                  size="lg"
                  onClick={startExercise}
                  disabled={!stream}
                  className="text-lg px-8 gap-2"
                >
                  <Camera className="h-5 w-5" />
                  Start Exercise
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopExercise}
                  className="text-lg px-8"
                >
                  Stop Exercise
                </Button>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    {(() => {
                      const IconComponent = getExerciseIcon(exercise.icon);
                      return <IconComponent className="h-7 w-7 text-primary" />;
                    })()}
                  </div>
                  <h2 className="text-3xl font-bold">{exercise.name}</h2>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {exercise.benefits}
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">How to do it:</h3>
              <ol className="space-y-3">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className="text-base">{instruction}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="p-6 bg-accent/10 border-accent/20">
              <h3 className="text-lg font-bold mb-3">💡 Tip</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Make sure you’re in a well-lit area and visible on camera.
                You’ll earn random points every 15 seconds while exercising!
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
