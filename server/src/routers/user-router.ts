import { Router } from "express";
import {
  checkAuth,
} from "../controller/user-controller";

const userRouter = Router();

userRouter.get("/check-auth", checkAuth);

export default userRouter;
