import { Router } from "express";
import {
  checkAuth,
  deleteConversation,
  getConversations,
  getMessageById,
  onChat,
  query,
} from "../controller/user-controller";

const userRouter: any = Router();

userRouter.get("/check-auth", checkAuth);
userRouter.post("/chat", onChat);
userRouter.get("/history-list", getConversations);
userRouter.get("/message/:conversationId", getMessageById);
userRouter.delete("/delete-conversation/:conversationId", deleteConversation);
userRouter.post("/query", query);

export default userRouter;
