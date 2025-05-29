import express from "express"
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from "cookie-parser"
import { connectDB } from "./lib/mongodb.js"
import adminRouter from "./routes/admin.route.js"
import studentRouter from "./routes/student.route.js"
import bookRouter from "./routes/book.route.js"
import cardRouter from "./routes/card.route.js"
import docketRouter from "./routes/docket.route.js"
import path from 'path'

dotenv.config()
const app = express()

// Cấu hình CORS cho phép frontend truy cập và gửi cookie
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}))

app.use(express.json())       // Phân tích JSON từ request body
app.use(cookieParser())       // Xử lý cookie

// Đăng ký các route API
app.use('/api/admin', adminRouter)
app.use('/api/student', studentRouter)
app.use('/api/book', bookRouter)
app.use('/api/card', cardRouter)
app.use('/api/docket', docketRouter)

// Phục vụ file tĩnh trong thư mục public
app.use(express.static(path.resolve('public')))

// Route kiểm tra server hoạt động
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

const port = process.env.PORT || 8017
const host = process.env.HOST || 'localhost'

// Khởi động server và kết nối DB
app.listen(port, '0.0.0.0', host, () => {
    console.log(`Server running on http://${host}:${port}`);
    connectDB();
});
