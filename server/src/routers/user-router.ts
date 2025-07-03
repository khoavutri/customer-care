import { Router } from "express";
import {
  checkAuth,
  getConversations,
  getMessageById,
  onChat,
} from "../controller/user-controller";

const userRouter: any = Router();

userRouter.get("/check-auth", checkAuth);
userRouter.post("/chat", onChat);
userRouter.get("/history-list", getConversations);
userRouter.get("/message/:conversationId", getMessageById);

export default userRouter;
