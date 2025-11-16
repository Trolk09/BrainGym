// server/index.ts — FULL FIXED VERSION
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { stopAllAutoPointAwards } from "./auto-points";
import { storage } from "./storage";

import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ===== Body Parsing =====
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

// ===== Logging =====
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  // Register API routes
  const server = await registerRoutes(app);

  // ============================================================
  // 🛠️ ADMIN ROUTES (JSON API for Admin.tsx)
  // ============================================================

  // Load leaderboard
  app.get("/admin/leaderboard", async (req, res) => {
    try {
      const rows = await storage.db.all(
        "SELECT username, points FROM users ORDER BY points DESC"
      );
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reset leaderboard
  app.post("/admin/reset-leaderboard", async (req, res) => {
    try {
      await storage.db.run("UPDATE users SET points = 0");
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update user points
  app.post("/admin/update-points", async (req, res) => {
    try {
      const { username, newPoints } = req.body;

      if (!username || newPoints === undefined) {
        return res
          .status(400)
          .json({ error: "username and newPoints required" });
      }

      await storage.db.run(
        "UPDATE users SET points = ? WHERE username = ?",
        newPoints,
        username
      );

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============================================================
  // Legacy Admin JSON routes
  // ============================================================
  app.get("/admin/users", async (req, res) => {
    try {
      const users = await storage.db.all(
        "SELECT username, points FROM users ORDER BY points DESC"
      );
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/admin/delete/:username", async (req, res) => {
    try {
      const { username } = req.params;
      await storage.db.run("DELETE FROM users WHERE username = ?", username);
      res.send(`🗑️ Deleted user: ${username}`);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/admin/setpoints/:username/:points", async (req, res) => {
    try {
      const { username, points } = req.params;
      const numericPoints = parseInt(points, 10);

      if (isNaN(numericPoints)) {
        return res.status(400).send("❌ Points must be a number");
      }

      await storage.db.run(
        "UPDATE users SET points = ? WHERE username = ?",
        numericPoints,
        username
      );

      res.send(`✅ ${username} now has ${numericPoints} points`);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============================================================
  // 🔥 Vite (dev) & static files (prod)
  // ============================================================
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ============================================================
  // ⭐ SPA FALLBACK ROUTE — FIXES WHITE SCREEN FOR /admin
  // ============================================================
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/admin/")) {
      return next();
    }

    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
  });

  // ============================================================
  // Error handler
  // ============================================================
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // ============================================================
  // Start server
  // ============================================================
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => log(`✅ Serving on port ${port}`)
  );

  // Cleanup
  process.on("SIGTERM", stopAllAutoPointAwards);
  process.on("SIGINT", stopAllAutoPointAwards);
})();
