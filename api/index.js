const express = require("express");
const cors = require("cors");

const app = express();

// middleware
app.use(express.json());

// CORS FIX (IMPORTANT)
app.use(cors({
  origin: "https://trello-frontend-eta.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

// TEST ROUTE
app.get("/", (req, res) => {
  res.json({ message: "API WORKING" });
});

// ROUTES
const authRoutes = require("../backend/routes/auth");
const taskRoutes = require("../backend/routes/tasks");

// IMPORTANT: wrap express properly for Vercel
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// THIS IS CRITICAL (Vercel handler export)
module.exports = (req, res) => {
  return app(req, res);
};