import express from "express";
import User from "../models/models.user.js";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/auth.js";

const authRouter = express.Router();

// Hàm tạo JWT token
const generateToken = (id) => {
  // Ký token JWT với payload chứa user ID, sử dụng secret key từ biến môi trường
  // Token sẽ có thời hạn 30 ngày
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register Route - POST /api/users/register
authRouter.post("/register", async (req, res) => {
  try {
    // Trích xuất username, email và password từ request body
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

    // Tạo user mới với thông tin từ request body
    // Password sẽ được tự động hash thông qua pre-save hook trong User model
    const user = await User.create({
      username,
      email,
      password,
    });

    // Kiểm tra xem user có được tạo thành công không
    if (user) {
      // Tạo JWT token cho người dùng mới đăng ký
      const token = generateToken(user._id);

      // Trả về thông tin user (không bao gồm password) và token với status 201 (Created)
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token,
      });
    } else {
      // Trường hợp không thể tạo user (hiếm khi xảy ra)
      res.status(400).json({
        message: "Dữ liệu user không hợp lệ",
      });
    }
  } catch (error) {
    // Xử lý lỗi server và trả về thông báo lỗi
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Login Route - POST /api/users/login
authRouter.post("/login", async (req, res) => {
  try {
    // Trích xuất email và password từ request body
    const { email, password } = req.body;

    // Kiểm tra xem email và password có được cung cấp không
    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ email và password",
      });
    }

    // Tìm user trong database bằng email
    const user = await User.findOne({ email });

    // Kiểm tra xem user có tồn tại và mật khẩu có đúng không
    // Sử dụng method matchPassword từ User model để so sánh mật khẩu
    if (user && (await user.matchPassword(password))) {
      // Nếu đăng nhập thành công, tạo JWT token cho user
      const token = generateToken(user._id);

      // Trả về thông tin user (không bao gồm password) và token
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token,
      });
    } else {
      // Nếu email không tồn tại hoặc mật khẩu không đúng
      // Trả về lỗi 401 (Unauthorized) với thông báo chung để bảo mật
      res.status(401).json({
        message: "Email hoặc mật khẩu không chính xác",
      });
    }
  } catch (error) {
    // Log lỗi để debug
    console.error(error);
    // Xử lý lỗi server và trả về thông báo lỗi
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Me Route - GET /api/users/me
// Mục đích là trả về thông tin người dùng đang đăng nhập
// Sẽ được bảo vệ bởi protect middleware
authRouter.get("/me", protect, async (req, res) => {
  try {
    // Tìm thông tin người dùng hiện tại bằng ID từ token đã được xác thực
    // req.user được gán từ protect middleware sau khi xác thực token thành công
    // .select("-password") để loại bỏ trường password khỏi kết quả trả về vì lý do bảo mật
    const user = await User.findById(req.user.id).select("-password");

    // Trả về thông tin người dùng dưới dạng JSON
    res.json(user);
  } catch (error) {
    // Xử lý lỗi server và trả về thông báo lỗi
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

export default authRouter;
