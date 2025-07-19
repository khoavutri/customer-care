import Conversation from "../models/conversation.model"
import Message from "../models/message.model"
import dotenv from "dotenv";
import { Request, Response } from "express";
import axios from "axios";
import { generateTitle } from "../util/generate-title";
import { dataLabeling, hybridSearch } from "../util/vector-handler";
import { loadVectorsFromFolder, readLabelFileSimple } from "../util/load-vectors";
import Score from "../models/score.model";
import mongoose from "mongoose";
import { calculatePoweredScores } from "../util/calculate";

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

    if (!userId) {
      return res.status(200).json({
        status: 0,
        message: 'Không tìm thấy thông tin người dùng từ token.',
      });
    }

    let finalConversationId = conversationId;
    let conversationChose = null
    if (conversationId) {
      const conversation = await Conversation.findOne({ _id: conversationId, userId });
      if (!conversation) {
        return res.status(200).json({
          status: 0,
          message: 'Cuộc trò chuyện không tồn tại hoặc không thuộc về bạn.',
        });
      }
      finalConversationId = conversation._id;
    } else {
      const newConversation = new Conversation({
        userId,
        title: generateTitle(prompt),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await newConversation.save();
      finalConversationId = newConversation._id;
      conversationChose = newConversation;
    }

    dataLabeling(prompt, userId, finalConversationId);
    const vectors = await loadVectorsFromFolder("data/vectors")
    const results = await hybridSearch(prompt, vectors, 3);
    const searchContext = JSON.stringify(
      results.map((item) => item.original)
    );

    const systemPrompt = `Bạn là chuyên gia tư vấn du lịch Việt Nam với khả năng:
- Tư vấn chi tiết các điểm du lịch, lịch trình, ẩm thực, văn hóa Việt Nam
- Trả lời bằng tiếng Việt tự nhiên, thân thiện
- Chỉ sử dụng dữ liệu được cung cấp để đưa ra lời khuyên chính xác
- Xử lý thông minh các câu hỏi ngoài phạm vi du lịch
- không được sử dụng thông tin bên ngoài, chỉ dựa vào dữ liệu được cung cấp
`;

    const userPrompt = `Câu hỏi: "${prompt.trim()}".
Dữ liệu tham khảo: ${searchContext}.

Hướng dẫn trả lời:
1. Nếu câu hỏi LIÊN QUAN đến du lịch Việt Nam:
   - Tư vấn chi tiết dựa trên dữ liệu được cung cấp
   - Nếu không có dữ liệu phù hợp: "Tôi không có dữ liệu về vấn đề này"
2. Nếu câu hỏi KHÔNG LIÊN QUAN đến du lịch:
   - Nhận diện và trả lời lịch sự
   - Chuyển hướng về chủ đề du lịch Việt Nam
   - Ví dụ: "Xin chào! Tôi là chuyên gia tư vấn du lịch Việt Nam. Bạn có muốn khám phá những điểm đến tuyệt vời nào ở Việt Nam không?"

Lưu ý: Chỉ sử dụng thông tin từ dữ liệu được cung cấp, không bổ sung thông tin bên ngoài.`;

    let userMessageTimestamp = new Date();
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(200).json({
          status: 0,
          message: 'Định dạng date không hợp lệ, phải là chuỗi ISO (VD: 2025-07-02T13:54:00.000Z).',
        });
      }
      userMessageTimestamp = parsedDate;
    }

    const userMessage = new Message({
      conversationId: finalConversationId,
      senderId: userId,
      sender: "user",
      content: prompt.trim(),
      model: 'Perplexity',
      timestamp: userMessageTimestamp,
      realExchange: userPrompt
    });
    userMessage.save();

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
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
        max_tokens: 250,
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

    const aiMessage = new Message({
      conversationId: finalConversationId,
      senderId: userId,
      sender: "ai",
      content: reply,
      model: 'Perplexity',
      timestamp: aiMessageTimestamp,
      realExchange: reply
    });

    aiMessage.save();

    await Conversation.findByIdAndUpdate(finalConversationId, { updatedAt: new Date() });

    res.status(200).json({
      status: 1,
      message: 'Chat với Perplexity ngon lành!',
      data: {
        reply,
        created: new Date(response.data.created * 1000).toISOString(),
        conversationId: finalConversationId,
        conversation: conversationChose
      },
    });

  } catch (error: any) {
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

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(200).json({
        status: 0,
        message: 'Không tìm thấy thông tin người dùng từ token.',
      });
    }

    const conversations = await Conversation.find({ userId })
      .select('_id title createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    const conversationIds = conversations.map((conv) => conv._id);
    const latestMessages = await Message.aggregate([
      { $match: { conversationId: { $in: conversationIds } } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$conversationId',
          latestMessage: { $first: '$content' },
          latestTimestamp: { $first: '$timestamp' },
        },
      },
    ]);

    const result = conversations.map((conv) => {
      const latestMsg = latestMessages.find((msg) => msg._id.toString() === conv._id.toString());
      return {
        conversationId: conv._id,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        latestMessage: latestMsg ? latestMsg.latestMessage : null,
        latestTimestamp: latestMsg ? latestMsg.latestTimestamp : null,
      };
    });

    res.status(200).json({
      status: 1,
      message: 'Lấy danh sách cuộc trò chuyện thành công!',
      data: result,
    });
  } catch (error: any) {
    console.error('Error in getConversations:', error.message);

    res.status(500).json({
      status: 0,
      message: 'Không thể lấy danh sách cuộc trò chuyện.',
      error: error.message || 'Lỗi không xác định',
    });
  }
};

export const getMessageById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(200).json({
        status: 0,
        message: 'Không tìm thấy thông tin người dùng từ token.',
      });
    }

    if (!conversationId) {
      return res.status(200).json({
        status: 0,
        message: 'Thiếu conversationId trong yêu cầu.',
      });
    }

    // Tìm cuộc trò chuyện theo ID và userId
    const conversation = await Conversation.findOne({ _id: conversationId, userId })
      .select('_id title createdAt updatedAt')
      .lean();

    if (!conversation) {
      return res.status(200).json({
        status: 0,
        message: 'Cuộc trò chuyện không tồn tại hoặc không thuộc về bạn.',
      });
    }

    // Lấy tất cả tin nhắn của cuộc trò chuyện, sắp xếp theo timestamp tăng dần
    const messages = await Message.find({ conversationId })
      .select('senderId sender content model timestamp realExchange')
      .sort({ timestamp: 1 })
      .lean();

    res.status(200).json({
      status: 1,
      message: 'Lấy thông tin cuộc trò chuyện thành công!',
      data: {
        conversation: {
          conversationId: conversation._id,
          title: conversation.title,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        },
        messages: messages.map((msg) => ({
          id: msg._id,
          senderId: msg.senderId,
          sender: msg.sender,
          content: msg.content,
          model: msg.model,
          timestamp: msg.timestamp,
          realExchange: msg.realExchange,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error in getConversationById:', error.message);

    res.status(500).json({
      status: 0,
      message: 'Không thể lấy thông tin cuộc trò chuyện.',
      error: error.message || 'Lỗi không xác định',
    });
  }
};

export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(200).json({
        status: 0,
        message: 'Không tìm thấy thông tin người dùng từ token.',
      });
    }

    if (!conversationId) {
      return res.status(200).json({
        status: 0,
        message: 'Vui lòng cung cấp conversationId.',
      });
    }

    const conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      return res.status(200).json({
        status: 0,
        message: 'Cuộc trò chuyện không tồn tại hoặc không thuộc về bạn.',
      });
    }

    await Conversation.deleteOne({ _id: conversationId, userId });
    await Message.deleteMany({ conversationId });
    await Score.deleteMany({ conversationId });

    return res.status(200).json({
      status: 1,
      message: 'Xóa cuộc trò chuyện và tin nhắn thành công!',
      data: { conversationId: conversationId }
    });

  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: 'Lỗi khi xóa cuộc trò chuyện.',
      error: error.message || 'Lỗi không xác định',
    });
  }
};

export const query = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ status: 0, message: 'fileId và prompt là bắt buộc' });
    }
    const vectors = await loadVectorsFromFolder("data/vectors")
    const results = await hybridSearch(prompt, vectors, 15);

    return res.status(200).json({
      status: 1,
      message: 'Xóa cuộc trò chuyện và tin nhắn thành công!',
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({ status: 0, message: error.message });
  }
};


export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const user = (req as any).user
    if (!user) {
      return res.status(200).json({ status: 0, message: 'userId là bắt buộc' });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const query: any = {
      userId: new mongoose.Types.ObjectId(user.id),
      createdAt: { $gte: sevenDaysAgo }
    };

    if (conversationId) {
      query.conversationId = new mongoose.Types.ObjectId(conversationId);
    }

    const rawResults = await Score.find(query)
      .sort({ createdAt: -1 })
      .limit(conversationId ? 10 : 0)

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = rawResults.map((item) => {
      const createdAt = new Date(item.createdAt);
      createdAt.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - createdAt.getTime();
      const dayBefore = Math.round(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...item.toObject(),
        dayBefore: Math.max(dayBefore, 0),
      };
    });

    const labelList = await readLabelFileSimple();
    const list = calculatePoweredScores(results, labelList)

    return res.status(200).json({
      status: 1,
      message: 'Lấy dữ liệu thành công',
      data: list,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message || 'Lỗi server'
    });
  }
};
