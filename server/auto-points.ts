import { storage } from "./storage";

const AUTO_AWARD_INTERVAL = 10 * 1000; // 10 seconds in milliseconds
const MIN_POINTS = 10;
const MAX_POINTS = 29;

function getRandomPoints(): number {
  return Math.floor(Math.random() * (MAX_POINTS - MIN_POINTS + 1)) + MIN_POINTS;
}

export function startAutoPointAward() {
  console.log("🎯 Auto-point award system started (awards every 10 seconds)");
  
  setInterval(async () => {
    try {
      const leaderboard = await storage.getLeaderboard();
      
      if (leaderboard.length === 0) {
        console.log("⏭️  No users on leaderboard yet, skipping auto-award");
        return;
      }
      
      for (const entry of leaderboard) {
        const points = getRandomPoints();
        await storage.addPassivePoints(entry.username, points);
        console.log(`✨ Auto-awarded ${points} points to ${entry.username}`);
      }
      
      console.log(`🎉 Auto-awarded points to ${leaderboard.length} user(s)`);
    } catch (error) {
      console.error("❌ Error in auto-point award:", error);
    }
  }, AUTO_AWARD_INTERVAL);
}
