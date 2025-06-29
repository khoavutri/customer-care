import { Router } from "express";

const demo = Router();

demo.get("/", (req, res) => {
  res.send("Welcome to the WebSocket server!");
});

demo.get("/about", (req, res) => {
  res.send("This is the about page.");
});

demo.get("/status", (req, res) => {
  res.json({ status: "running", uptime: process.uptime() });
});

export default demo;
