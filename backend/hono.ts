import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { appRouter } from "@/backend/trpc/app-router";
import { createContext } from "@/backend/trpc/create-context";

// app will be mounted at /api
const app = new Hono();

// Enable logging
app.use("*", logger());

// Enable CORS for all routes
app.use("*", cors({
  origin: ['http://localhost:3000', 'https://*.rork.com'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "Banda API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
app.get("/info", (c) => {
  return c.json({
    name: "Banda API",
    version: "1.0.0",
    description: "Backend API for Banda marketplace application",
    endpoints: {
      trpc: "/api/trpc",
      health: "/api/",
      info: "/api/info"
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.onError((err, c) => {
  const errorMessage = err?.message?.slice(0, 200) || 'Unknown error';
  console.error('🚨 Server Error:', errorMessage);
  return c.json({
    error: 'Internal Server Error',
    message: errorMessage,
    timestamp: new Date().toISOString()
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested endpoint was not found',
    timestamp: new Date().toISOString()
  }, 404);
});

export default app;