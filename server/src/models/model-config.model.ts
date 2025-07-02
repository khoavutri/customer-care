import mongoose from "mongoose";
export const modelAiList = ["Perplexity", "GPT", "Grok"]

const ModelConfigSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    preferredModel: { type: String, enum: modelAiList, required: true },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("ModelConfig", ModelConfigSchema);