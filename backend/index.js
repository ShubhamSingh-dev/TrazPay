import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import userRouter from "./routers/user.router.js";
import accountRouter from "./routers/account.router.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to DB
connectDB();

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/account", accountRouter);

app.get("/", (req, res) => {
  res.send("API is working!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
