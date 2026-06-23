import express from "express";
import cors from "cors";
import connectDB from "../config/db.js";
import authRoutes from "../routes/auth.js";
import taskRoutes from "../routes/tasks.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "https://to-do-application-frontend-phi.vercel.app",
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS?.split(",") || []),
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

let isConnected = false;

const connect = async () => {
  if (isConnected) return;

  try {
    await connectDB();
    isConnected = true;
  } catch (err) {
    console.error("Database startup error:", err.message);
  }
};

connect();

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => res.send("API Running..."));

export default app;
