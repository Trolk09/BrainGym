import { Router } from "express";
import { storage } from "../storage";

export function registerAdminRoutes() {
  const router = Router();

  // -----------------------------------------------------------
  // GET all users
  // -----------------------------------------------------------
  router.get("/users", async (_req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.json({ users: leaderboard });
  });

  // -----------------------------------------------------------
  // DELETE user by username
  // -----------------------------------------------------------
  router.delete("/delete/:username", async (req, res) => {
    const { username } = req.params;

    const entry = await storage.getLeaderboardEntryByUsername(username);
    if (!entry) return res.status(404).json({ error: "User not found" });

    storage["leaderboardEntries"].delete(entry.id);

    res.json({ message: `Deleted ${username}` });
  });

  // -----------------------------------------------------------
  // SET user points (override)
  // -----------------------------------------------------------
  router.post("/setpoints/:username/:points", async (req, res) => {
    const { username, points } = req.params;
    const pts = Number(points);

    if (Number.isNaN(pts) || pts < 0)
      return res.status(400).json({ error: "Invalid points" });

    let entry = await storage.getLeaderboardEntryByUsername(username);
    if (!entry) return res.status(404).json({ error: "User not found" });

    // override points
    entry.totalPoints = pts;
    entry.updatedAt = new Date();

    storage["leaderboardEntries"].set(entry.id, entry);

    res.json({ message: `Set ${username} to ${pts} points`, entry });
  });

  // -----------------------------------------------------------
  // ADD points to a user
  // -----------------------------------------------------------
  router.post("/addpoints/:username/:points", async (req, res) => {
    const { username, points } = req.params;
    const pts = Number(points);

    if (Number.isNaN(pts) || pts <= 0)
      return res.status(400).json({ error: "Invalid points" });

    let entry = await storage.getLeaderboardEntryByUsername(username);
    if (!entry)
      return res.status(404).json({ error: "User not found" });

    entry.totalPoints += pts;
    entry.updatedAt = new Date();

    storage["leaderboardEntries"].set(entry.id, entry);

    res.json({ message: `Added ${pts} points to ${username}`, entry });
  });

  return router;
}
