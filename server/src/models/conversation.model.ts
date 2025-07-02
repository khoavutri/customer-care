import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "New Conversation" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ConversationSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model("Conversation", ConversationSchema);