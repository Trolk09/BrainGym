import {
  type LeaderboardEntry,
  type InsertLeaderboardEntry,
  type ExerciseSession,
  type InsertExerciseSession,
  leaderboardEntries,
  exerciseSessions,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  getLeaderboardEntryByUsername(username: string): Promise<LeaderboardEntry | undefined>;
  createOrUpdateLeaderboardEntry(username: string, pointsToAdd: number): Promise<LeaderboardEntry>;
  addPassivePoints(username: string, pointsToAdd: number): Promise<LeaderboardEntry>;
  createExerciseSession(session: InsertExerciseSession): Promise<ExerciseSession>;
  getSessionsByUsername(username: string): Promise<ExerciseSession[]>;
}

export class DatabaseStorage implements IStorage {
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return db
      .select()
      .from(leaderboardEntries)
      .orderBy(desc(leaderboardEntries.totalPoints));
  }

  async getLeaderboardEntryByUsername(username: string): Promise<LeaderboardEntry | undefined> {
    const [entry] = await db
      .select()
      .from(leaderboardEntries)
      .where(eq(leaderboardEntries.username, username));
    return entry;
  }

  async createOrUpdateLeaderboardEntry(username: string, pointsToAdd: number): Promise<LeaderboardEntry> {
    if (pointsToAdd <= 0) {
      throw new Error("Points must be greater than 0 to update leaderboard");
    }

    const existing = await this.getLeaderboardEntryByUsername(username);

    if (existing) {
      const [updated] = await db
        .update(leaderboardEntries)
        .set({
          totalPoints: existing.totalPoints + pointsToAdd,
          exercisesCompleted: existing.exercisesCompleted + 1,
          updatedAt: new Date(),
        })
        .where(eq(leaderboardEntries.username, username))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(leaderboardEntries)
      .values({
        username,
        totalPoints: pointsToAdd,
        exercisesCompleted: 1,
      })
      .returning();
    return created;
  }

  async addPassivePoints(username: string, pointsToAdd: number): Promise<LeaderboardEntry> {
    if (pointsToAdd <= 0) {
      throw new Error("Points must be greater than 0 to add");
    }

    const existing = await this.getLeaderboardEntryByUsername(username);
    if (!existing) {
      throw new Error("Cannot add passive points to non-existent user");
    }

    const [updated] = await db
      .update(leaderboardEntries)
      .set({
        totalPoints: existing.totalPoints + pointsToAdd,
        updatedAt: new Date(),
      })
      .where(eq(leaderboardEntries.username, username))
      .returning();
    return updated;
  }

  async createExerciseSession(insertSession: InsertExerciseSession): Promise<ExerciseSession> {
    const [session] = await db
      .insert(exerciseSessions)
      .values({
        ...insertSession,
        feedback: insertSession.feedback ?? null,
      })
      .returning();
    return session;
  }

  async getSessionsByUsername(username: string): Promise<ExerciseSession[]> {
    return db
      .select()
      .from(exerciseSessions)
      .where(eq(exerciseSessions.username, username))
      .orderBy(desc(exerciseSessions.createdAt));
  }
}

export const storage = new DatabaseStorage();
