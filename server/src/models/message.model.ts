import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: String, emum: ["user", "ai"], required: true },
    content: { type: String, required: true },
    realExchange: { type: String, required: true },
    model: { type: String, default: "perplexity" },
    timestamp: { type: Date, default: Date.now }
});

MessageSchema.index({ conversationId: 1, timestamp: -1 });

export default mongoose.model("Message", MessageSchema);