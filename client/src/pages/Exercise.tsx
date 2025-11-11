import { useEffect, useRef, useState, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { EXERCISES, type ExerciseType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getExerciseIcon } from "@/lib/icons";

export default function Exercise() {
  const [, params] = useRoute("/exercise/:exerciseId");
  const [, setLocation] = useLocation();
  const exerciseId = params?.exerciseId as ExerciseType;
  const exercise = EXERCISES[exerciseId];

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(() => {
    return Number(localStorage.getItem("totalPoints")) || 0;
  });
  const [timeLeft, setTimeLeft] = useState(60);
  const [lastValidation, setLastValidation] = useState<{
    encouragement: string;
    feedback: string;
    pointsEarned: number;
    isCorrect: boolean;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const username = localStorage.getItem("brainGymUsername") || "";

  // Redirect if no username
  useEffect(() => {
    if (!username) setLocation("/");
  }, [username, setLocation]);

  // Start/stop camera
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
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [exercise, setLocation]);

  // Dummy capture (kept for compatibility)
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }, []);

  const handleStartCapture = () => {
    setIsCapturing(true);
    setTimeLeft(60);
  };

  const handleStopCapture = () => {
    setIsCapturing(false);
    setLastValidation(null);
    setTimeLeft(60);
  };

  const handleFinishExercise = () => {
    if (sessionPoints > 0) {
      setLocation(`/results/${exerciseId}/${sessionPoints}`);
    } else {
      setLocation("/");
    }
  };

  // Auto-capture dummy frame (optional visual effect)
  useEffect(() => {
    if (!isCapturing) return;
    const interval = setInterval(captureFrame, 3000);
    return () => clearInterval(interval);
  }, [isCapturing, captureFrame]);

  // Timer countdown
  useEffect(() => {
    if (!isCapturing || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleStopCapture();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCapturing, timeLeft]);

  // 🧠 Auto-award random points every 15s (30–55)
  useEffect(() => {
    if (!isCapturing) return;
    const interval = setInterval(() => {
      const randomPoints = Math.floor(Math.random() * (55 - 30 + 1)) + 30;

      setSessionPoints((prev) => prev + randomPoints);
      setTotalPoints((prev) => {
        const updated = prev + randomPoints;
        localStorage.setItem("totalPoints", updated.toString());
        return updated;
      });

      setLastValidation({
        encouragement: "Great job! Keep going!",
        feedback: `You earned ${randomPoints} automatic points!`,
        pointsEarned: randomPoints,
        isCorrect: true,
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [isCapturing]);

  if (!exercise) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="gap-2"
            >
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
                <span className="text-muted-foreground">Points:</span>
                <span className="ml-2 font-bold text-foreground">
                  {totalPoints}
                </span>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
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
                  <div className="text-center space-y-4">
                    <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">
                      Starting camera...
                    </p>
                  </div>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

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

            {lastValidation && (
              <Card
                className={`p-6 ${
                  lastValidation.isCorrect
                    ? "border-primary bg-primary/5"
                    : "border-muted"
                }`}
              >
                <div className="flex items-start gap-4">
                  {lastValidation.isCorrect ? (
                    <CheckCircle2 className="h-8 w-8 text-primary mt-1" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-muted-foreground mt-1" />
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold text-foreground">
                      {lastValidation.encouragement}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {lastValidation.feedback}
                    </p>
                    {lastValidation.isCorrect && (
                      <div className="flex items-center gap-2 pt-2">
                        <Badge variant="default" className="text-base px-3 py-1">
                          +{lastValidation.pointsEarned} points!
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

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
                  <h2 className="text-3xl font-bold text-foreground">
                    {exercise.name}
                  </h2>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {exercise.benefits}
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">
                How to do it:
              </h3>
              <ol className="space-y-3">
                {exercise.instructions.map((instruction, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <span className="text-base text-foreground leading-relaxed pt-0.5">
                      {instruction}
                    </span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="p-6 bg-accent/10 border-accent/20">
              <h3 className="text-lg font-bold text-foreground mb-3">💡 Tip</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Make sure you're in a well-lit area and the camera can see your
                whole body. The app now gives you automatic points every 15
                seconds while exercising!
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
