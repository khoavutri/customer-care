import { generateJWT, authenticateJWT } from "../auth";
import { findUserByUsername } from "../user";
import { Router } from "express";
import bcrypt from "bcryptjs";
const authRouter: any = Router();

authRouter.post("/login", (req: any, res: any) => {
  const { username, password } = req.body;

  const user = findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = generateJWT({ id: user.id, username: user.username });
  res.json({ token });
});

authRouter.get("/protected", authenticateJWT, (req: any, res: any) => {
  res.json({ message: "Welcome to the protected route", user: req.user });
});

export default authRouter;
