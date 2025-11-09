// auto-points.ts — scoped auto-points for active exercises only

import { storage } from "./storage";

const AUTO_AWARD_INTERVAL = 15 * 1000; // 15 seconds
const MIN_POINTS = 40;
const MAX_POINTS = 79;

function getRandomPoints(): number {
  return Math.floor(Math.random() * (MAX_POINTS - MIN_POINTS + 1)) + MIN_POINTS;
}

/**
 * Starts a per-session auto-award system.
 * Returns a cleanup function that stops the timer.
 */
export function startAutoPointAward(username: string) {
  console.log(`🎯 Auto-point session started for ${username}`);

  const intervalId = setInterval(async () => {
    try {
      const points = getRandomPoints();
      await storage.addPassivePoints(username, points);
      console.log(`✨ +${points} random points to ${username}`);
    } catch (err) {
      console.error("❌ Error adding auto-points:", err);
    }
  }, AUTO_AWARD_INTERVAL);

  // Return a function to stop this loop
  return () => {
    clearInterval(intervalId);
    console.log(`🛑 Auto-point session stopped for ${username}`);
  };
}
