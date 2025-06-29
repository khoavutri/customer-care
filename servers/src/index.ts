import express from "express";
import http from "http";
import demo from "./routers/demo";
import authRouter from "./routers/auth-router";

const app = express();
const PORT = 8668;
// Tạo HTTP server từ Express
const server = http.createServer(app);
app.use("/demo", demo);
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRouter);

// Endpoint kiểm tra
app.get("/", (req, res) => {
  res.send("WebSocket server is running!");
});

// Khởi chạy server
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
