import mongoose from "mongoose";

const Scorechema = new mongoose.Schema({
    label: { type: String, required: true },
    score: { type: Number, required: true },
    prompt: { type: String, required: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, {
    timestamps: true,
});

export default mongoose.model("Score", Scorechema);
