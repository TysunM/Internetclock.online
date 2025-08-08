import { type Express } from "express";
import { createServer } from "http";
import { createServer } from "https";
import { storage } from "./storage";

export function registerRoutes(app: Express) {
  // Basic health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  const httpsServer = createServer(app);
  return httpServer;
  return httpsServer;
}
