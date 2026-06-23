const express = require("express");
const cors = require("cors");

const app = express();

// MUST be first
app.use(express.json());

// CORS (simple + correct)
app.use(cors({
  origin: "https://trello-frontend-eta.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

// TEST ROUTE
app.get("/", (req, res) => {
  res.json({ message: "API working" });
});

// ROUTES
const authRoutes = require("../backend/routes/auth");
const taskRoutes = require("../backend/routes/tasks");

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// ✅ IMPORTANT: correct Vercel export
module.exports = app;