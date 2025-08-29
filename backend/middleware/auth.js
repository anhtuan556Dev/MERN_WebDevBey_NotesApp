import User from "../models/models.user.js";
import jwt from "jsonwebtoken";

// Middleware bảo vệ route - yêu cầu người dùng phải đăng nhập
const protect = async (req, res, next) => {
  let token;

  try {
    // Kiểm tra Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Trích xuất token từ header (Bearer <token>)
      token = req.headers.authorization.split(" ")[1];

      // Sử dụng jwt.verify để giải mã token bằng JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm người dùng bằng ID từ token đã giải mã
      req.user = await User.findById(decoded.id).select("-password");

      // Gọi next() để chuyển sang handler tiếp theo
      next();
    } else {
      res.status(401).json({
        message: "Không có token, truy cập bị từ chối",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({
      message: "Token không hợp lệ, người dùng không được ủy quyền",
    });
  }
};

export { protect };
