import fs from "fs";
import path from "path";
import { type Express } from "express";
import { createServer as createViteServer, type ViteDevServer } from "vite";

export function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  console.log(`${formattedTime} [express] ${message}`);
}

export async function setupVite(app: Express, server: any) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);
  return vite;
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/public");
  const indexPath = path.join(distPath, "index.html");

  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find ${distPath}`);
  }

  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(indexPath);
  });
}
