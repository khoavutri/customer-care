import User from "../models/user";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET as string;

// Đăng ký (Signup)
export const registerUser = async (req: Request, res: Response) => {
  const { password, email, name } = req.body;
  const username = email;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(200).json({
        status: 0,
        data: null,
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      name,
      age: 0,
    });
    await newUser.save();

    res.status(200).json({
      status: 1,
      data: null,
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      data: null,
      message: "Internal server error",
    });
  }
};

// Đăng nhập (Login)
export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(200).json({
        status: 0,
        data: null,
        message: "Invalid username or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(200).json({
        status: 0,
        data: null,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      status: 1,
      data: { user: { id: user._id, username: user.username }, token },
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      data: null,
      message: "Internal server error",
    });
  }
};

//Đổi mật khẩu
export const changePassword = async (req: Request, res: Response) => {
  const { username, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(200).json({
        status: 0,
        data: null,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(200).json({
        status: 0,
        data: null,
        message: "Old password is incorrect",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({
      status: 1,
      data: null,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      data: null,
      message: "Internal server error",
    });
  }
};
