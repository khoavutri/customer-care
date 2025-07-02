import dotenv from "dotenv";
import { Request, Response } from "express";
import OpenAI from "openai";

dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.GROK_KEY,
  baseURL: "https://api.x.ai/v1",
});
export const checkAuth = (req: Request, res: Response) => {
  res.status(200).json({
    status: 1,
    message: "Authenticated successfully",
    data: { user: (req as any).user },
  });
};

export const onChat = async (req: Request, res: Response) => {
  console.log(process.env.GPT_KEY);
  try {
    const { prompt } = req.body;

    // Kiểm tra xem prompt có được gửi không
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        status: 0,
        message: "Prompt is required and must be a string",
      });
    }

    const response = await openai.chat.completions.create({
      model: "grok-beta", // Dùng grok-beta, thay bằng grok-2-1212 nếu có quyền
      messages: [
        { role: "system", content: "Nói tiếng Việt, trả lời tự nhiên, vui vẻ như nói với bố!" },
        { role: "user", content: prompt },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content ?? "Hỏng rồi, không có phản hồi!";
    res.status(200).json({
      status: 1,
      message: "Chat với Grok ngon lành nha bố!",
      data: { reply, created: new Date(response.created * 1000).toISOString() },
    });

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({
      status: 0,
      message: "Failed to generate GPT response",
    });
  }
};