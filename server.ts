import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { handleFootballScores } from "./src/footballApiHandler";
import { runSyncAgent } from "./src/syncAgent";

// Load environment variables (supports locally saved .env if present)
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request body parser
  app.use(express.json());

  // Health and verification check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Secure API proxy route to fetch football-data.org matches
  app.get("/api/football-scores", (req, res) => {
    handleFootballScores(req, res);
  });

  // Score Sync Agent triggering routes (supports both GET and POST for maximum convenience)
  app.all("/api/sync-agent/run", async (req, res) => {
    try {
      const force = req.query.force === "true" || req.body?.force === true;
      const report = await runSyncAgent(force);
      res.json(report);
    } catch (error: any) {
      console.error("[Sync Agent API Route Error]:", error);
      res.status(500).json({
        success: false,
        message: `שגיאה בהפעלת סוכן הסנכרון: ${error.message || error}`
      });
    }
  });

  // Setup Vite development server middleware OR serve static compilation assets
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode servicing compiled assets...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files from the build output directory
    app.use(express.static(distPath));
    
    // SPA fallback: Route all direct URL requests back to index.html for React Router
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`World Cup Predictions 2026 server running at http://0.0.0.0:${PORT}`);
    
    // Auto-Sync background job is active. Polling fallback.
    const syncIntervalMinutes = Number(process.env.AUTO_SYNC_INTERVAL_MINUTES || "15");
    if (syncIntervalMinutes > 0 && process.env.FOOTBALL_DATA_API_KEY) {
      console.log(`[Background Job] Score Auto-Sync agent is active. Polling configured for every ${syncIntervalMinutes} minutes.`);
      setInterval(async () => {
        console.log(`[Background Job] Starting scheduled score sync loop...`);
        try {
          const report = await runSyncAgent();
          console.log(`[Background Job] Scheduled sync result:`, report.message);
        } catch (err) {
          console.error(`[Background Job] Scheduled score sync failed:`, err);
        }
      }, syncIntervalMinutes * 60 * 1000);
    }
  });
}

startServer().catch((err) => {
  console.error("Critical server startup crash:", err);
  process.exit(1);
});
