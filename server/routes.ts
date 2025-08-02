import { type Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";

export function registerRoutes(app: Express) {
  // Basic health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
