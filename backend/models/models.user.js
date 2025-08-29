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
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Tạo salt và hash mật khẩu
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Custom method để so sánh mật khẩu
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);

export default User;
