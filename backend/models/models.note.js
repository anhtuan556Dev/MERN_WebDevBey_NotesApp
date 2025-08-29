import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    // Tiêu đề của ghi chú
    title: {
      type: String,
      required: true,
    },
    // Nội dung mô tả của ghi chú
    description: {
      type: String,
      required: true,
    },
    // Người tạo ghi chú (tham chiếu đến User)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    // Tự động thêm createdAt và updatedAt
    timestamps: true,
  }
);

const Note = mongoose.model("Note", NoteSchema);

export default Note;
