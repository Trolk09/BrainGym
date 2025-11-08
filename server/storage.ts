import {
  type LeaderboardEntry,
  type InsertLeaderboardEntry,
  type ExerciseSession,
  type InsertExerciseSession,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Leaderboard methods
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  getLeaderboardEntryByUsername(username: string): Promise<LeaderboardEntry | undefined>;
  createOrUpdateLeaderboardEntry(username: string, pointsToAdd: number): Promise<LeaderboardEntry>;
  addPassivePoints(username: string, pointsToAdd: number): Promise<LeaderboardEntry>;
  
  // Exercise session methods
  createExerciseSession(session: InsertExerciseSession): Promise<ExerciseSession>;
  getSessionsByUsername(username: string): Promise<ExerciseSession[]>;
}

export class MemStorage implements IStorage {
  private leaderboardEntries: Map<string, LeaderboardEntry>;
  private exerciseSessions: Map<string, ExerciseSession>;

  constructor() {
    this.leaderboardEntries = new Map();
    this.exerciseSessions = new Map();
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const entries = Array.from(this.leaderboardEntries.values());
    return entries.sort((a, b) => b.totalPoints - a.totalPoints);
  }

  async getLeaderboardEntryByUsername(username: string): Promise<LeaderboardEntry | undefined> {
    return Array.from(this.leaderboardEntries.values()).find(
      (entry) => entry.username === username
    );
  }

  async createOrUpdateLeaderboardEntry(username: string, pointsToAdd: number): Promise<LeaderboardEntry> {
    // Only update if points are being added (correct exercise completion)
    if (pointsToAdd <= 0) {
      throw new Error("Points must be greater than 0 to update leaderboard");
    }

    const existing = await this.getLeaderboardEntryByUsername(username);
    
    if (existing) {
      existing.totalPoints += pointsToAdd;
      existing.exercisesCompleted += 1;
      existing.updatedAt = new Date();
      this.leaderboardEntries.set(existing.id, existing);
      return existing;
    }

    const id = randomUUID();
    const now = new Date();
    const newEntry: LeaderboardEntry = {
      id,
      username,
      totalPoints: pointsToAdd,
      exercisesCompleted: 1,
      createdAt: now,
      updatedAt: now,
    };
    
    this.leaderboardEntries.set(id, newEntry);
    return newEntry;
  }

  async addPassivePoints(username: string, pointsToAdd: number): Promise<LeaderboardEntry> {
    // Add points without incrementing exercisesCompleted (for auto-awards)
    if (pointsToAdd <= 0) {
      throw new Error("Points must be greater than 0 to add");
    }

    const existing = await this.getLeaderboardEntryByUsername(username);
    
    if (!existing) {
      throw new Error("Cannot add passive points to non-existent user");
    }

    existing.totalPoints += pointsToAdd;
    existing.updatedAt = new Date();
    this.leaderboardEntries.set(existing.id, existing);
    return existing;
  }

  async createExerciseSession(insertSession: InsertExerciseSession): Promise<ExerciseSession> {
    const id = randomUUID();
    const session: ExerciseSession = {
      ...insertSession,
      feedback: insertSession.feedback ?? null,
      id,
      createdAt: new Date(),
    };
    this.exerciseSessions.set(id, session);
    return session;
  }

  async getSessionsByUsername(username: string): Promise<ExerciseSession[]> {
    return Array.from(this.exerciseSessions.values())
      .filter((session) => session.username === username)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
