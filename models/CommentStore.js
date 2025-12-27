import mongoose from "mongoose";

const codebaseCommentSchema = new mongoose.Schema({
  codebase: {
    type: String,
    required: true
  },
  filecomment: {
    type: Map,
    of: String,
    default: new Map()
  }
}, { _id: false });

const commentStoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  comments: {
    type: [codebaseCommentSchema],
    default: []
  }
}, { timestamps: true });

export const CommentStore = mongoose.model(
  "CommentStore",
  commentStoreSchema
);
