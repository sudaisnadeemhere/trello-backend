const express = require("express");
const cors = require("cors");

const app = express();

// 1. middleware first
app.use(express.json());

// 2. cors
app.use(cors({
  origin: "https://trello-frontend-eta.vercel.app"
}));

// 👇 ADD ROUTES HERE (THIS IS THE CORRECT PLACE)
const authRoutes = require("../backend/routes/auth");
const taskRoutes = require("../backend/routes/tasks");

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// test route
app.get("/", (req, res) => {
  res.json({ message: "API working" });
});

module.exports = app;