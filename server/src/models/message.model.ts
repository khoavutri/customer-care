import mongoose from "mongoose";
import { modelAiList } from "./model-config.model";

const MessageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: String, required: true },
    content: { type: String, required: true },
    realExchange: { type: String, required: true },
    model: { type: String, enum: modelAiList, default: modelAiList[0] },
    timestamp: { type: Date, default: Date.now }
});

// Tạo index để tối ưu truy vấn
MessageSchema.index({ conversationId: 1, timestamp: -1 });

export default mongoose.model("Message", MessageSchema);