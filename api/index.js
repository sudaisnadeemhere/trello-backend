const express = require("express");
const cors = require("cors");

const app = express();

// MUST be first
app.use(express.json());

// CORS (simple + correct)
let isConnected = false;

const connect = async () => {
  if (isConnected) return;
  await connectDB();
  isConnected = true;
};

connect();

// ── CORS ─────────────────────────────
app.use(cors({
  origin: "https://to-do-application-frontend-phi.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));




// ── Body parsers ────────────────────
app.use(express.json());



app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://to-do-application-frontend-phi.vercel.app");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  next();
});

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