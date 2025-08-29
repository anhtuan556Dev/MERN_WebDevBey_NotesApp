import express from "express";
import { protect } from "../middleware/auth.js";
import Note from "../models/models.note.js";

const notesRouter = express.Router();
// Get All Notes Route - GET /api/notes
notesRouter.get("/", protect, async (req, res) => {
  try {
    // Tìm tất cả ghi chú của người dùng hiện tại
    const notes = await Note.find({ createdBy: req.user._id });
    // Trả về danh sách ghi chú dưới dạng JSON
    res.json(notes);
  } catch (error) {
    // Xử lý lỗi server và trả về thông báo lỗi
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Create Note Route - POST /api/notes
notesRouter.post("/", protect, async (req, res) => {
  try {
    // Trích xuất title và description từ request body
    const { title, description } = req.body;

    // Kiểm tra xem title và description có được cung cấp không
    if (!title || !description) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ title và description",
      });
    }

    // Tạo một ghi chú mới với thông tin từ request body và ID người dùng hiện tại
    const note = await Note.create({
      title,
      description,
      createdBy: req.user._id,
    });

    // Trả về ghi chú vừa tạo với status code 201 (Created)
    res.status(201).json(note);
  } catch (error) {
    // Xử lý lỗi server và trả về thông báo lỗi
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Get Single Note Route - GET /api/notes/:id
notesRouter.get("/:id", protect, async (req, res) => {
  try {
    // Tìm ghi chú theo ID được cung cấp trong params
    const note = await Note.findById(req.params.id);

    // Kiểm tra xem ghi chú có tồn tại hay không
    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    // Kiểm tra quyền: Đảm bảo ghi chú thuộc về người dùng hiện tại
    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    // Trả về ghi chú dưới dạng JSON
    res.json(note);
  } catch (error) {
    // Xử lý lỗi server và trả về thông báo lỗi
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Update Note Route - PUT /api/notes/:id
notesRouter.put("/:id", protect, async (req, res) => {
  const { title, description } = req.body;

  try {
    // Tìm ghi chú theo ID được cung cấp trong params
    const note = await Note.findById(req.params.id);

    // Kiểm tra xem ghi chú có tồn tại hay không
    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    // Kiểm tra quyền: Đảm bảo note.createdBy khớp với req.user._id
    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    // Cập nhật title và description của ghi chú
    note.title = title || note.title;
    note.description = description || note.description;

    // Lưu ghi chú đã cập nhật
    const updatedNote = await note.save();

    // Trả về ghi chú đã cập nhật dưới dạng JSON
    res.json(updatedNote);
  } catch (error) {
    // Xử lý lỗi server và trả về thông báo lỗi
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Delete Note Route - DELETE /api/notes/:id
notesRouter.delete("/:id", protect, async (req, res) => {
  try {
    // Tìm ghi chú theo ID được cung cấp trong params
    const note = await Note.findById(req.params.id);

    // Kiểm tra xem ghi chú có tồn tại hay không
    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    // Kiểm tra quyền: Đảm bảo note.createdBy khớp với req.user._id
    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    // Xóa ghi chú khỏi cơ sở dữ liệu
    await Note.deleteOne({ _id: req.params.id });

    // Trả về thông báo xác nhận xóa thành công
    res.json({
      message: "Note was deleted",
    });
  } catch (error) {
    // Xử lý lỗi server và trả về thông báo lỗi
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

export default notesRouter;
