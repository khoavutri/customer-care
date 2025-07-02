import Conversation from "../models/conversation.model"
import Message from "../models/message.model"
import dotenv from "dotenv";
import { Request, Response } from "express";
import axios from "axios";

dotenv.config();

export const checkAuth = (req: Request, res: Response) => {
  res.status(200).json({
    status: 1,
    message: "Authenticated successfully",
    data: { user: (req as any).user },
  });
};


export const onChat = async (req: Request, res: Response) => {
  try {
    const { prompt, conversationId, date } = req.body;
    const userId = (req as any).user?.id;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
      return res.status(400).json({
        status: 0,
        message: 'Prompt phải là chuỗi hợp lệ, ít nhất 5 ký tự.',
      });
    }
    if (!userId) {
      return res.status(401).json({
        status: 0,
        message: 'Không tìm thấy thông tin người dùng từ token.',
      });
    }

    let finalConversationId = conversationId;
    if (conversationId) {
      const conversation = await Conversation.findOne({ _id: conversationId, userId });
      if (!conversation) {
        return res.status(400).json({
          status: 0,
          message: 'Cuộc trò chuyện không tồn tại hoặc không thuộc về bạn.',
        });
      }
      finalConversationId = conversation._id;
    } else {
      const newConversation = new Conversation({
        userId,
        title: 'New Conversation',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await newConversation.save();
      finalConversationId = newConversation._id;
    }

    let userMessageTimestamp = new Date();
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          status: 0,
          message: 'Định dạng date không hợp lệ, phải là chuỗi ISO (VD: 2025-07-02T13:54:00.000Z).',
        });
      }
      userMessageTimestamp = parsedDate;
    }

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Nói tiếng Việt, trả lời tự nhiên, vui vẻ như nói với bố! Cung cấp thông tin chính xác và ngắn gọn.',
          },
          { role: 'user', content: prompt.trim() },
        ],
        search_mode: 'web',
        reasoning_effort: 'medium',
        temperature: 0.2,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        top_k: 0,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 0,
        web_search_options: { search_context_size: 'low' },
        max_tokens: 100,
        return_citations: false,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const reply = response.data.choices[0]?.message?.content ?? 'Hỏng rồi, không có phản hồi!';
    const aiMessageTimestamp = new Date(response.data.created * 1000);

    const userMessage = new Message({
      conversationId: finalConversationId,
      senderId: userId,
      content: prompt.trim(),
      model: 'Perplexity',
      timestamp: userMessageTimestamp,
      realExchange: prompt.trim()
    });
    const aiMessage = new Message({
      conversationId: finalConversationId,
      senderId: 'AI',
      content: reply,
      model: 'Perplexity',
      timestamp: aiMessageTimestamp,
      realExchange: reply
    });
    await Promise.all([userMessage.save(), aiMessage.save()]);

    await Conversation.findByIdAndUpdate(finalConversationId, { updatedAt: new Date() });

    res.status(200).json({
      status: 1,
      message: 'Chat với Perplexity ngon lành!',
      data: {
        reply,
        created: new Date(response.data.created * 1000).toISOString(),
        conversationId: finalConversationId,
      },
    });

  } catch (error: any) {
    console.error('Error in onChat:', JSON.stringify(error.response?.data || error.message, null, 2));

    if (error.response && error.response.status === 400) {
      return res.status(400).json({
        status: 0,
        message: 'Yêu cầu không hợp lệ. Vui lòng kiểm tra nội dung prompt hoặc mô hình.',
        error: error.response.data.error || 'Không có thông tin lỗi chi tiết',
      });
    }
    if (error.response && error.response.status === 401) {
      return res.status(401).json({
        status: 0,
        message: 'Khóa API Perplexity không hợp lệ.',
        error: error.response.data.error || 'Lỗi xác thực API',
      });
    }

    res.status(500).json({
      status: 0,
      message: 'Failed to process chat request',
      error: error.message || 'Lỗi không xác định',
    });
  }
};