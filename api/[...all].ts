import express from "express";
import { createServer } from "http";
import type { IncomingMessage, ServerResponse } from "http";
import { registerRoutes } from "./server/routes";

// Create an express app and register routes but do NOT call listen().
// Vercel will invoke this file per request; we reuse the same app instance
// across invocations to improve cold-start behavior.

const app = express();
// basic middleware used by server/routes registration expects json parsing to be already set
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register our routes once. registerRoutes expects an http.Server and an Express app.
// Provide a server built from the app but do not call listen.
void (async () => {
  try {
    // createServer returns a Server but we don't start listening
    const httpServer = createServer(app as any);
    await registerRoutes(httpServer, app as any);
  } catch (err) {
    // Log errors during route registration so Vercel build logs include them
    // eslint-disable-next-line no-console
    console.error("Failed to register routes for serverless wrapper:", err);
  }
})();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Express apps are also request handlers: (req,res) => void
  // @ts-expect-error - Node's IncomingMessage/ServerResponse are compatible with Express types at runtime
  return (app as any)(req, res);
}
