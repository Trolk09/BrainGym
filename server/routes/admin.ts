import { Router } from "express";
import { storage } from "../storage";

export const adminRouter = Router();

// Get all leaderboard raw entries
adminRouter.get("/users", (req, res) => {
  const list = Array.from(storage.leaderboardEntries.values());
  res.json(list);
});

// Delete by username (old method)
adminRouter.delete("/delete-user/:username", (req, res) => {
  const username = req.params.username;

  let deleted = false;

  for (const [id, entry] of storage.leaderboardEntries.entries()) {
    if (entry.username === username) {
      storage.leaderboardEntries.delete(id);
      deleted = true;
    }
  }

  if (!deleted) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ message: `Deleted user '${username}'` });
});

// ⭐ NEW: Delete by ID (fix ghost user)
adminRouter.delete("/delete-id/:id", (req, res) => {
  const id = req.params.id;

  if (!storage.leaderboardEntries.has(id)) {
    return res.status(404).json({ error: "Leaderboard entry not found" });
  }

  storage.leaderboardEntries.delete(id);

  res.json({ message: `Deleted entry with ID ${id}` });
});
