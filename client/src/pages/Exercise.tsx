import { useCallback, useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { EXERCISES } from "@shared/schema";
import { memoryStore } from "@/lib/memoryStore";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Camera, VideoOff } from "lucide-react";
import { getExerciseIcon } from "@/lib/icons";

const CAPTURE_INTERVAL_MS = 8000;

export default function Exercise() {
  const [, params] = useRoute("/exercise/:id");
  const [, setLocation] = useLocation();
  const id = params?.id;
  const exercise = EXERCISES[id];

  const [sessionPoints, setSessionPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [capturing, setCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [, forceRender] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not supported in this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera permission was denied. Please allow camera access and try again."
          : err instanceof DOMException && err.name === "NotFoundError"
          ? "No camera was found on this device."
          : "Couldn't access the camera. Please check your device settings.";
      setCameraError(message);
      return false;
    }
  }, []);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  const givePoints = (pts: number) => {
    setSessionPoints((p) => p + pts);
    memoryStore.totalPoints += pts;

    const user = memoryStore.leaderboard.find(
      (u) => u.username === memoryStore.username
    );
    if (user) user.points += pts;
    forceRender((n) => n + 1);
  };

  const runValidation = useCallback(async () => {
    const imageData = captureFrame();
    if (!imageData || !id) return;

    setValidating(true);
    try {
      const res = await apiRequest("POST", "/api/exercises/validate", {
        exerciseType: id,
        imageData,
        username: memoryStore.username || "Guest",
      });
      const result = await res.json();
      setLastFeedback(`${result.encouragement} ${result.feedback}`);
      if (result.isCorrect && result.pointsEarned > 0) {
        givePoints(result.pointsEarned);
      }
    } catch (err) {
      setLastFeedback("Couldn't reach the server to check your exercise — try again.");
    } finally {
      setValidating(false);
    }
  }, [captureFrame, id]);

  const handleStart = async () => {
    const ok = await startCamera();
    if (!ok) return;
    setSessionPoints(0);
    setTimeLeft(60);
    setLastFeedback(null);
    setCapturing(true);
  };

  const handleStop = () => {
    setCapturing(false);
    stopCamera();
  };

  useEffect(() => {
    if (!capturing) return;

    const interval = setInterval(() => {
      runValidation();
    }, CAPTURE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [capturing, runValidation]);

  useEffect(() => {
    if (!capturing) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setCapturing(false);
          stopCamera();
          return 60;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [capturing, stopCamera]);

  // Always release the camera when leaving the page
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  if (!exercise) return null;

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

        {cameraError && (
          <Card className="p-4 mt-6 border-destructive/50 bg-destructive/10 flex items-center gap-3">
            <VideoOff className="text-destructive shrink-0" />
            <p className="text-sm">{cameraError}</p>
          </Card>
        )}

        {capturing && (
          <Card className="p-4 mt-6 overflow-hidden">
            <div className="relative rounded-md overflow-hidden bg-black aspect-video">
              <video
                ref={videoRef}
                muted
                playsInline
                className="w-full h-full object-cover -scale-x-100"
              />
              {validating && (
                <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                  <Camera className="w-3 h-3 animate-pulse" /> Checking...
                </div>
              )}
            </div>
          </Card>
        )}
        <canvas ref={canvasRef} className="hidden" />

        <div className="mt-6 flex gap-4">
          {!capturing ? (
            <Button onClick={handleStart} size="lg" className="gap-2">
              <Camera className="w-4 h-4" /> Start Exercise
            </Button>
          ) : (
            <Button variant="destructive" onClick={handleStop} size="lg">
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
            {lastFeedback && (
              <p className="text-sm mt-3 text-muted-foreground">{lastFeedback}</p>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
