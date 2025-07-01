import { Request, Response } from "express";

export const checkAuth = (req: Request, res: Response) => {
  res.status(200).json({
    status: 1,
    message: "Authenticated successfully",
    data: { user: (req as any).user },
  });
};

