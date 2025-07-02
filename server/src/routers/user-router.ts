import { Router } from "express";
import {
  checkAuth,
  onChat,
} from "../controller/user-controller";

const userRouter: any = Router();

userRouter.get("/check-auth", checkAuth);
userRouter.post("/chat", onChat);

export default userRouter;
