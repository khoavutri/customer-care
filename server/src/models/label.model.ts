import mongoose from "mongoose";

const LabelSchema = new mongoose.Schema({
    label: { type: String, required: true },
    question: { type: String, required: true },
});

export default mongoose.model("Label", LabelSchema);
