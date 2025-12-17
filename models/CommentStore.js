import mongoose from "mongoose";

const commentStoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  codebase: {
    type: String,
    default: "default"
  },
  comments: {
    type: Map,
    of: String,
    default: {}
  }
}, { timestamps: true });

export const CommentStore = mongoose.model(
  "CommentStore",
  commentStoreSchema
);
