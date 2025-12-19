import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  console.log(`[serveStatic] Serving static files from: ${distPath}`);
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    console.log(`[serveStatic] Catch-all for ${req.originalUrl}, sending index.html`);
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
