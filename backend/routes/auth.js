import express from "express";
import User from "../models/models.user.js";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/auth.js";

const authRouter = express.Router();

// Hàm tạo JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register Route - POST /api/users/register
authRouter.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kiểm tra tất cả các trường có được cung cấp không
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ username, email và password",
      });
    }

    // Kiểm tra user đã tồn tại bằng email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User đã tồn tại với email này",
      });
    }

    // Tạo user mới
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      // Tạo JWT token cho người dùng mới
      const token = generateToken(user._id);

      // Trả về ID, username, email, và token của người dùng
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token,
      });
    } else {
      res.status(400).json({
        message: "Dữ liệu user không hợp lệ",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Login Route - POST /api/users/login
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user bằng email
    const user = await User.findOne({ email });

    // Sử dụng user.matchPassword để so sánh mật khẩu
    if (user && (await user.matchPassword(password))) {
      // Nếu thành công, tạo JWT token
      const token = generateToken(user._id);

      // Trả về ID, username, email, và token của người dùng
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token,
      });
    } else {
      // Nếu thông tin không hợp lệ, trả về lỗi "Invalid credentials"
      res.status(401).json({
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Me Route - GET /api/users/me
//Mục đích là trả về thông tin người dùng đang đăng nhập
// Sẽ được bảo vệ bởi protect middleware
authRouter.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

export default authRouter;
