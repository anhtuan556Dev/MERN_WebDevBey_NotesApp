import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.js";
import notesRouter from "./routes/notes.js";

// Cấu hình dotenv để đọc các biến môi trường từ file .env
dotenv.config();

// Thiết lập PORT từ biến môi trường hoặc sử dụng 5000 làm mặc định
const PORT = process.env.PORT || 5000;

// Khởi tạo ứng dụng Express
const app = express();

// Kết nối đến cơ sở dữ liệu MongoDB
connectDB();

// Middleware để xử lý JSON
app.use(express.json());

// Định nghĩa route cho auth
app.use("/api/users", authRouter);

// Định nghĩa route cho notes
app.use("/api/notes", notesRouter);

// Định nghĩa route GET cho trang chủ
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Khởi động server và lắng nghe trên PORT đã định nghĩa
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
