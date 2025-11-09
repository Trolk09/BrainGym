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
import { startSessionAutoPoints } from "@/lib/auto-points";

export default function Exercise() {
  const [, params] = useRoute("/exercise/:exerciseId");
  const [, setLocation] = useLocation();
  const exerciseId = params?.exerciseId as ExerciseType;
  const exercise = EXERCISES[exerciseId];

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stopAutoPointsRef = useRef<() => void | null>(null);

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
    };
  }, [exercise, setLocation]);

  // Save points to leaderboard when exercise ends
  const addPointsMutation = useMutation({
    mutationFn: async (pointsToAdd: number) => {
      await apiRequest("POST", "/api/leaderboard", { username, pointsToAdd });
    },
    onSuccess: () => refetch(),
  });

  // Timer countdown
  useEffect(() => {
    if (!isCapturing || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleStopCapture();
          handleFinishExercise();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCapturing, timeLeft]);

  // --- Handlers ---
  const handleStartCapture = () => {
    setIsCapturing(true);
    setSessionPoints(0);
    setTimeLeft(60);

    // start random auto-points
    stopAutoPointsRef.current = startSessionAutoPoints(username);

    // locally track points every 15s (sync with auto-points)
    const localInterval = setInterval(() => {
      if (!isCapturing) {
        clearInterval(localInterval);
        return;
      }
      const random = Math.floor(Math.random() * (79 - 40 + 1)) + 40;
      setSessionPoints((prev) => prev + random);
    }, 15000);

    stopAutoPointsRef.current = () => {
      clearInterval(localInterval);
      if (stopAutoPointsRef.current) {
        stopAutoPointsRef.current();
      }
    };
  };

  const handleStopCapture = () => {
    setIsCapturing(false);
    if (stopAutoPointsRef.current) {
      stopAutoPointsRef.current();
      stopAutoPointsRef.current = null;
    }
  };

  const handleFinishExercise = async () => {
    handleStopCapture();
    if (sessionPoints > 0) {
      await addPointsMutation.mutateAsync(sessionPoints);
      setLocation(`/results/${exerciseId}/${sessionPoints}`);
    } else {
      setLocation("/");
    }
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
              {isCapturing && (
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
                  <p className="mt-4 text-lg text-muted-foreground">
                    Starting camera...
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              {!isCapturing ? (
                <>
                  <Button
                    size="lg"
                    onClick={handleStartCapture}
                    disabled={!stream}
                    className="text-lg px-8 gap-2"
                  >
                    <Camera className="h-5 w-5" />
                    Start Exercise
                  </Button>
                  {sessionPoints > 0 && (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleFinishExercise}
                      className="text-lg px-8"
                    >
                      Finish Exercise
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleStopCapture}
                  className="text-lg px-8"
                >
                  Stop Exercise
                </Button>
              )}
            </div>

            <Card className="p-6 bg-accent/10 border-accent/20 text-center text-lg">
              {isCapturing
                ? `🧩 Session Points: ${sessionPoints}`
                : `You’ve earned ${sessionPoints} points this session!`}
            </Card>
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
                Stay visible in the camera and move freely — your session points
                will grow automatically every few seconds!
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
