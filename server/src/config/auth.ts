import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "khoa12345";

// Định nghĩa interface cho payload của JWT
interface JwtPayload {
  id: number;
  username: string;
}

// Mở rộng Request để thêm thuộc tính user
interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// Middleware xác thực JWT
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

export interface AuthRequest extends Request {
  user?: { id: string; username: string };
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
    };
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ status: 0, message: "Token không hợp lệ" });
  }
};

// Hàm tạo JWT
export const generateJWT = (user: { id: number; username: string }) => {
  return jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
    expiresIn: "1d",
  });
};
