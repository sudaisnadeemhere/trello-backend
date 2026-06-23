import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";

dotenv.config();

const app = express();

// DB connection
let isConnected = false;

const connect = async () => {
if (isConnected) return;
await connectDB();
isConnected = true;
};

connect();

// CORS
app.use(
cors({
origin: "https://trello-frontend-eta.vercel.app",
methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
allowedHeaders: ["Content-Type", "Authorization"],
credentials: true,
})
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Extra CORS headers
app.use((req, res, next) => {
res.header(
"Access-Control-Allow-Origin",
"https://trello-frontend-eta.vercel.app"
);
res.header(
"Access-Control-Allow-Headers",
"Content-Type, Authorization"
);
res.header(
"Access-Control-Allow-Methods",
"GET,POST,PUT,DELETE,OPTIONS"
);
next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
res.send({ message: "Trello-lite backend running" });
});

export default app;
