import express from "express";
import http from "http";
import cors from "cors";
import authRouter from "./routers/auth-router";
import userRouter from "./routers/user-router";
import adminRouter from "./routers/admin-router";
import connectDB from "./config/database";
import { authenticateJWT, isAdmin } from "./config/auth";

const app = express();
const PORT = process.env.PORT || 8080;
// Tạo HTTP server từ Express
const server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: "*", credentials: true }));
connectDB();

app.use("/auth", authRouter);
app.use("/user", authenticateJWT, userRouter);
app.use("/admin", authenticateJWT, isAdmin, adminRouter);

// Endpoint kiểm tra
app.get("/", (req, res) => {
  res.send("WebSocket server is running!");
});

// Khởi chạy server
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
