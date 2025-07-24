import { Application } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import AuthRoutes from "./auth.routes";

export const setupRoutes = (app: Application): void => {
  // Health check
  app.get(
    "/health",
    asyncHandler(async (_req, res) => {
      res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    })
  );
  console.log("🩺 Health check route setup completed");

  // API routes
  app.use("/api/auth", AuthRoutes);
  console.log("Auth routes setup completed");

  // URL routes
  const UrlRoutes = require("./url.routes").default;
  app.use("/api/urls", UrlRoutes);
  console.log("URL routes setup completed");

  const redirectRoutes = require("./redirect.routes").default;
  app.use("/", redirectRoutes);

    // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
    });
  });

  console.log("404 handler setup completed");
};
