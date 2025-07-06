import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "khoa12345";

interface JwtPayload {
  id: number;
  username: string;
  role: "user" | "admin"; // Thêm trường role
}

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token is missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
    return;
  }
};

export const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Yêu cầu quyền admin" });
  }
};

export const generateJWT = (user: {
  id: any;
  username: string;
  role: "user" | "admin";
}) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET_KEY,
    {
      expiresIn: "24h",
    }
  );
};

export interface AuthRequest extends Request {
  user?: { id: string; username: string; role: "user" | "admin" };
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): any => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      status: 0,
      data: null,
      message: "Định dạng token không hợp lệ",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      status: 0,
      data: null,
      message: "Không có token, truy cập bị từ chối",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: string;
      username: string;
      role: "user" | "admin";
    };
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ status: 0, message: "Token không hợp lệ" });
  }
};