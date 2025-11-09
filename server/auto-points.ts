// server/auto-points.ts — safe passive points system with full exports

import { storage } from "./storage";

const AUTO_AWARD_INTERVAL = 15 * 1000; // every 15 seconds
const MIN_POINTS = 40;
const MAX_POINTS = 79;

// track active award loops (username -> interval id)
const activeSessions = new Map<string, NodeJS.Timeout>();

function getRandomPoints(): number {
  return Math.floor(Math.random() * (MAX_POINTS - MIN_POINTS + 1)) + MIN_POINTS;
}

/**
 * Starts auto-point awarding for a user.
 * - Normalizes username
 * - Checks that the user exists before starting
 * - Prevents duplicate loops
 */
export async function startAutoPointAward(username: string): Promise<void> {
  if (!username) return;
  username = username.trim().toLowerCase();

  if (activeSessions.has(username)) {
    console.log(`⚙️ Auto-point loop already running for ${username}`);
    return;
  }

  // check if storage provides getUser
  const user = storage.getUser ? await storage.getUser(username) : undefined;
  if (!user) {
    console.warn(`⚠️ Cannot start auto-points — user "${username}" not found.`);
    return;
  }

  console.log(`🎯 Auto-point session started for ${username}`);

  const intervalId = setInterval(async () => {
    try {
      const userCheck = storage.getUser ? await storage.getUser(username) : undefined;
      if (!userCheck) {
        console.warn(`⚠️ Skipping auto-points — user "${username}" missing.`);
        return;
      }

      const points = getRandomPoints();
      if (typeof storage.addPassivePoints !== "function") {
        console.warn("⚠️ storage.addPassivePoints not implemented; skipping award.");
        return;
      }

      await storage.addPassivePoints(username, points);
      console.log(`✨ +${points} passive points to ${username}`);
    } catch (err) {
      console.error("❌ Error adding auto-points:", err);
    }
  }, AUTO_AWARD_INTERVAL);

  activeSessions.set(username, intervalId);
}

/**
 * Stops auto-point awarding for a user.
 */
export function stopAutoPointAward(username: string): void {
  if (!username) return;
  username = username.trim().toLowerCase();

  const intervalId = activeSessions.get(username);
  if (!intervalId) return;

  clearInterval(intervalId);
  activeSessions.delete(username);
  console.log(`🛑 Auto-point session stopped for ${username}`);
}

/**
 * Stops all active auto-point loops (useful on server shutdown).
 */
export function stopAllAutoPointAwards(): void {
  for (const [username, intervalId] of activeSessions.entries()) {
    clearInterval(intervalId);
    console.log(`🧹 Stopped auto-points for ${username}`);
  }
  activeSessions.clear();
}
