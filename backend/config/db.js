import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Kết nối đến MongoDB sử dụng URI từ biến môi trường
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // In thông báo thành công kèm theo host của kết nối
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // In lỗi ra console nếu kết nối thất bại
    console.log(error);
    // Thoát ứng dụng với mã lỗi 1
    process.exit(1);
  }
};

export default connectDB;
