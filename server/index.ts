// --- IMPORTS ---
import express, { type Request, Response, NextFunction } from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from "./routes.ts";
import { setupVite, log } from "./vite.ts";

// --- PATH HELPERS (This is where the new lines go) ---
// These helpers give us the absolute path to the current file and its directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- EXPRESS APP SETUP ---
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Custom logging middleware from your original file
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

// Health check endpoint from your original file
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// --- MAIN ASYNC SETUP ---
(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // --- VITE DEV vs. PRODUCTION STATIC SERVING ---
  if (app.get("env") === "development") {
    // In development, use Vite's dev server
    await setupVite(app, server);
  } else {
    // In production, serve the built client files
    const clientDistPath = path.resolve(__dirname, '../../client/dist');
    app.use(express.static(clientDistPath));
    // For any unhandled route, send back the client's index.html for client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(clientDistPath, 'index.html'));
    });
  }

  // --- START SERVER ---
  const port = process.env.PORT || 80;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
