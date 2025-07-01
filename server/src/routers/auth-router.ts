import { loginUser, registerUser } from "../controller/auth-controller";
import { Router } from "express";

const authRouter: any = Router();

authRouter.post("/signup", registerUser);
authRouter.post("/login", loginUser);

export default authRouter;
