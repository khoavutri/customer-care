import express from "express";
import cors from "cors";
import https from 'https';
import fs from 'fs';
import path from 'path';
import http from "http";
import authRouter from "./routers/auth-router";
import userRouter from "./routers/user-router";
import adminRouter from "./routers/admin-router";
import connectDB from "./config/database";
import { authenticateJWT, isAdmin } from "./config/auth";

const app = express();
const PORT = process.env.PORT || 8080;
// Tạo HTTP server từ Express
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

const key = fs.readFileSync(path.join(__dirname, '../ssl/private.key'), 'utf8');
const cert = fs.readFileSync(path.join(__dirname, '../ssl/certificate.crt'), 'utf8');
const ca = fs.readFileSync(path.join(__dirname, '../ssl/ca-chain.crt'), 'utf8');

const credentials = { key, cert, ca };

http.createServer(app).listen(PORT, () => {
  console.log(`HTTPS server running on port ${PORT}`);
});

