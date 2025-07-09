import dotenv from "dotenv";
import { Request, Response } from "express";
import { generateVectorsFromJson } from "../util/vector-handler";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import User from "../models/user";
import fs from 'fs/promises';

dotenv.config();

export const uploadJson = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 0, message: 'No file uploaded' });
        }
        const fileId = uuidv4();
        const outPath = path.join('data/vectors', `${fileId}.json`);
        const n = await generateVectorsFromJson(req.file.path, outPath);

        res.status(200).json({
            status: 1,
            message: `Đã xử lý xong ${n} records.`,
            vectorFile: outPath,
            fileId,
        });
    } catch (error: any) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

export const cleanupVectors = async (req: Request, res: Response) => {
    try {
        const vectorsDir = path.join('data', 'vectors');
        const fileDir = path.join('data', 'files');

        try {
            await fs.access(vectorsDir);
            await fs.rm(vectorsDir, { recursive: true, force: true });
            await fs.access(fileDir);
            await fs.rm(fileDir, { recursive: true, force: true });
        } catch {
            return res.status(200).json({
                status: 1,
                message: 'Directory does not exist or is already empty',
                deleted: true
            });
        }

        await fs.mkdir(fileDir, { recursive: true });
        await fs.mkdir(vectorsDir, { recursive: true });

        res.status(200).json({
            status: 1,
            message: 'Successfully deleted vectors directory and recreated empty directory',
            deleted: true
        });
    } catch (error: any) {
        res.status(500).json({
            status: 0,
            message: `Error cleaning up vectors directory: ${error.message}`
        });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const { pageSize = 10, page = 1, name, email } = req.body;
        const pageNumber = parseInt(page as string) || 1;
        const limit = parseInt(pageSize as string) || 10;
        const skip = (pageNumber - 1) * limit;

        const query: any = {};
        if (name) {
            query.name = { $regex: name as string, $options: 'i' };
        }
        if (email) {
            query.email = { $regex: email as string, $options: 'i' };
        }

        const usersRaw = await User.find(query)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .lean();

        const users = usersRaw.map(user => ({
            ...user,
            id: user._id.toString(),
        }));

        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);

        res.status(200).json({
            status: 1,
            data: {
                users,
                pagination: {
                    currentPage: pageNumber,
                    pageSize: limit,
                    totalUsers,
                    totalPages,
                },
            },
            message: "Users retrieved successfully",
        });
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({
            status: 0,
            data: null,
            message: "Internal server error",
        });
    }
};

export const grantAdmin = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(200).json({
                status: 0,
                data: null,
                message: "User ID is required",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(200).json({
                status: 0,
                data: null,
                message: "User not found",
            });
        }

        if (user.role === "admin") {
            return res.status(200).json({
                status: 0,
                data: null,
                message: "User is already an admin",
            });
        }

        user.role = "admin";
        await user.save();

        res.status(200).json({
            status: 1,
            data: null,
            message: "Admin privileges granted successfully",
        });
    } catch (error) {
        console.error("Grant admin error:", error);
        res.status(500).json({
            status: 0,
            data: null,
            message: "Internal server error",
        });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(200).json({
                status: 0,
                data: null,
                message: "User ID is required",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(200).json({
                status: 0,
                data: null,
                message: "User not found",
            });
        }

        if (user.role === "admin") {
            return res.status(200).json({
                status: 0,
                data: null,
                message: "Cannot delete an admin user",
            });
        }

        await User.deleteOne({ _id: userId });

        res.status(200).json({
            status: 1,
            data: null,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            status: 0,
            data: null,
            message: "Internal server error",
        });
    }
};