import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { validateExercise } from "./openai";
import { exerciseValidationSchema, insertExerciseSessionSchema } from "@shared/schema";
import { z } from "zod";

// Schema for POST /api/leaderboard
const updateLeaderboardSchema = z.object({
  username: z.string().min(1, "Username is required"),
  pointsToAdd: z.number().int().positive("Points must be a positive integer"),
});

// Enhanced schema for POST /api/sessions with stricter validation
const createSessionSchema = insertExerciseSessionSchema.extend({
  username: z.string().min(1, "Username is required"),
  pointsEarned: z.number().int().nonnegative("Points earned must be a non-negative integer"),
  isCorrect: z.union([z.literal(0), z.literal(1)], {
    errorMap: () => ({ message: "isCorrect must be 0 or 1" })
  }),
  feedback: z.string().min(1, "Feedback is required").optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/exercises/validate - Validate exercise performance using OpenAI Vision
  app.post("/api/exercises/validate", async (req, res) => {
    try {
      const validatedData = exerciseValidationSchema.parse(req.body);
      
      const result = await validateExercise(
        validatedData.exerciseType,
        validatedData.imageData
      );

      // Normalize and validate AI response
      const normalizedResult = {
        ...result,
        pointsEarned: Math.max(0, Math.floor(result.pointsEarned || 0)),
        feedback: result.feedback || "Keep practicing!",
        encouragement: result.encouragement || "You're doing great!",
      };

      // Record the session
      await storage.createExerciseSession({
        username: validatedData.username,
        exerciseType: validatedData.exerciseType,
        pointsEarned: normalizedResult.pointsEarned,
        isCorrect: normalizedResult.isCorrect ? 1 : 0,
        feedback: normalizedResult.feedback,
      });

      // Update leaderboard only if points were earned (correct exercise)
      if (normalizedResult.isCorrect && normalizedResult.pointsEarned > 0) {
        await storage.createOrUpdateLeaderboardEntry(
          validatedData.username,
          normalizedResult.pointsEarned
        );
      }

      res.json(normalizedResult);
    } catch (error) {
      console.error("Error validating exercise:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to validate exercise" });
    }
  });

  // GET /api/leaderboard - Get leaderboard sorted by points
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // GET /api/sessions/:username - Get exercise sessions for a user
  app.get("/api/sessions/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const sessions = await storage.getSessionsByUsername(username);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // POST /api/sessions - Create a new exercise session
  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = createSessionSchema.parse(req.body);
      const session = await storage.createExerciseSession(validatedData);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // POST /api/leaderboard - Update leaderboard entry
  app.post("/api/leaderboard", async (req, res) => {
    try {
      const validatedData = updateLeaderboardSchema.parse(req.body);
      const entry = await storage.createOrUpdateLeaderboardEntry(
        validatedData.username,
        validatedData.pointsToAdd
      );
      res.json(entry);
    } catch (error) {
      console.error("Error updating leaderboard:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update leaderboard" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
