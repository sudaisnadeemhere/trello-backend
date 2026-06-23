const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("../backend/config/db");
const authRoutes = require("../backend/routes/auth");
const taskRoutes = require("../backend/routes/tasks");

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(express.json());

// CORS (IMPORTANT FIX)
const corsOptions = {
  origin: "https://trello-frontend-eta.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "backend working" });
});

module.exports = app;