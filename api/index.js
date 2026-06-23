const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("../backend/config/db");
const authRoutes = require("../backend/routes/auth");
const taskRoutes = require("../backend/routes/tasks");

const app = express();

// DB
connectDB();

app.use(express.json());

// CORS
app.use(cors({
  origin: "https://trello-frontend-eta.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.json({ message: "backend working" });
});

module.exports = app;