import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Exercise types available in Brain Gym
export const exerciseTypes = [
  "cross-crawl",
  "lazy-8s",
  "brain-buttons",
  "earth-buttons",
  "elephant-swings",
  "double-doodle"
] as const;

export type ExerciseType = typeof exerciseTypes[number];

// Exercise metadata
export interface Exercise {
  id: ExerciseType;
  name: string;
  description: string;
  instructions: string[];
  benefits: string;
  icon: string;
}

// Leaderboard entries
export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull(),
  totalPoints: integer("total_points").notNull().default(0),
  exercisesCompleted: integer("exercises_completed").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;

// Exercise sessions (tracking individual exercise attempts)
export const exerciseSessions = pgTable("exercise_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull(),
  exerciseType: text("exercise_type").notNull(),
  pointsEarned: integer("points_earned").notNull(),
  isCorrect: integer("is_correct").notNull(), // 1 for correct, 0 for incorrect (sqlite doesn't have boolean)
  feedback: text("feedback"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertExerciseSessionSchema = createInsertSchema(exerciseSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertExerciseSession = z.infer<typeof insertExerciseSessionSchema>;
export type ExerciseSession = typeof exerciseSessions.$inferSelect;

// Exercise validation request/response
export const exerciseValidationSchema = z.object({
  exerciseType: z.enum(exerciseTypes),
  imageData: z.string(), // base64 encoded image
  username: z.string().min(1),
});

export type ExerciseValidationRequest = z.infer<typeof exerciseValidationSchema>;

export interface ExerciseValidationResponse {
  isCorrect: boolean;
  feedback: string;
  pointsEarned: number;
  encouragement: string;
}

// Static exercise data
export const EXERCISES: Record<ExerciseType, Exercise> = {
  "cross-crawl": {
    id: "cross-crawl",
    name: "Cross Crawl",
    description: "Connect your brain hemispheres!",
    instructions: [
      "Stand or sit comfortably",
      "Slowly bring your right elbow to your left knee",
      "Then bring your left elbow to your right knee",
      "Repeat the movement smoothly",
      "Keep your movements controlled and deliberate"
    ],
    benefits: "Connects the left and right sides of the brain and helps with mental coordination.",
    icon: "activity"
  },
  "lazy-8s": {
    id: "lazy-8s",
    name: "Lazy 8s",
    description: "Draw infinity in the air!",
    instructions: [
      "Extend your arm straight in front of you",
      "Make a large figure-eight (∞) shape in the air",
      "Trace the shape with your eyes following your hand",
      "Repeat with the other hand",
      "Try using both hands together!"
    ],
    benefits: "Improves eyesight, peripheral vision, and wrist flexibility.",
    icon: "infinity"
  },
  "brain-buttons": {
    id: "brain-buttons",
    name: "Brain Buttons",
    description: "Activate your energy points!",
    instructions: [
      "Sit or stand comfortably",
      "Place one hand on your belly",
      "Place the other hand just below your collarbone",
      "Gently massage both spots in circular motions",
      "Feel the energy flowing!"
    ],
    benefits: "Boosts blood flow to the brain and increases focus.",
    icon: "zap"
  },
  "earth-buttons": {
    id: "earth-buttons",
    name: "Earth Buttons",
    description: "Ground yourself with energy!",
    instructions: [
      "Sit or stand in a relaxed position",
      "Place your right hand on your lips",
      "Place your left hand on your navel",
      "Use small, circular motions to rub both spots",
      "Stay calm and focused"
    ],
    benefits: "Enhances mental alertness and body orientation.",
    icon: "globe"
  },
  "elephant-swings": {
    id: "elephant-swings",
    name: "Elephant Swings",
    description: "Swing like an elephant!",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Extend one arm straight out",
      "Place the other hand on the same-side ear",
      "Draw a large figure-eight with your extended arm",
      "Swing from your shoulder, not just your wrist",
      "Repeat with the other arm"
    ],
    benefits: "Improves balance and listening skills.",
    icon: "move"
  },
  "double-doodle": {
    id: "double-doodle",
    name: "Double Doodle",
    description: "Draw with both hands!",
    instructions: [
      "Get a piece of paper and two markers or crayons",
      "Use both hands at the same time",
      "Draw symmetrical shapes or patterns",
      "Try drawing matching circles, hearts, or stars",
      "Have fun creating mirrored art!"
    ],
    benefits: "Enhances bilateral coordination and creativity.",
    icon: "pencil"
  }
};
