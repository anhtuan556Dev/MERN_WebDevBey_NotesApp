import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    // Tên người dùng
    username: {
      type: String,
      required: true,
      unique: true,
    },
    // Địa chỉ email
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // Mật khẩu
    password: {
      type: String,
      required: true,
    },
  },
  {
    // Tự động thêm createdAt và updatedAt
    timestamps: true,
  }
);

// Pre-save hook để hash mật khẩu trước khi lưu
UserSchema.pre("save", async function (next) {
  // Chỉ hash lại mật khẩu nếu nó đã được sửa đổi
  // Kiểm tra xem trường password có bị thay đổi không trước khi hash
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Tạo salt với độ phức tạp 10 để tăng bảo mật
    const salt = await bcryptjs.genSalt(10);
    // Hash mật khẩu với salt vừa tạo và gán lại cho trường password
    this.password = await bcryptjs.hash(this.password, salt);
    // Chuyển tiếp đến middleware tiếp theo
    next();
  } catch (error) {
    // Truyền lỗi cho middleware xử lý lỗi
    next(error);
  }
});

// Custom method để so sánh mật khẩu
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // So sánh mật khẩu đã nhập với mật khẩu đã hash trong database
  // bcryptjs.compare sẽ trả về true nếu mật khẩu hợp lệ, false nếu không
  return await bcryptjs.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);

export default User;
