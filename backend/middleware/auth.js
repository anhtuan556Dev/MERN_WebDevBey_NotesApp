import User from "../models/models.user.js";
import jwt from "jsonwebtoken";

// Middleware bảo vệ route - yêu cầu người dùng phải đăng nhập
const protect = async (req, res, next) => {
  let token;

  try {
    // Kiểm tra xem có Authorization header không và có bắt đầu bằng "Bearer" không
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Trích xuất token từ Authorization header (định dạng: "Bearer <token>")
      // Tách chuỗi theo dấu cách và lấy phần tử thứ 2 (index 1)
      token = req.headers.authorization.split(" ")[1];

      // Giải mã và xác thực token bằng JWT_SECRET từ biến môi trường
      // jwt.verify sẽ trả về payload đã được decode nếu token hợp lệ
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm thông tin người dùng trong database bằng ID từ token đã giải mã
      // .select("-password") để loại bỏ trường password khỏi kết quả trả về
      req.user = await User.findById(decoded.id).select("-password");

      // Chuyển tiếp đến middleware hoặc route handler tiếp theo
      next();
    } else {
      // Trường hợp không có token hoặc format không đúng
      res.status(401).json({
        message: "Không có token, truy cập bị từ chối",
      });
    }
  } catch (error) {
    // Log lỗi để debug
    console.error(error);
    // Trả về lỗi 401 khi token không hợp lệ hoặc đã hết hạn
    res.status(401).json({
      message: "Token không hợp lệ, người dùng không được ủy quyền",
    });
  }
};

export { protect };
