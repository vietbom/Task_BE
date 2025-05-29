import jwt from "jsonwebtoken"
import { User } from "../model/User.model.js"

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        if (!token) {
            return res.status(401).json({ message: "Bạn chưa đăng nhập!" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findByPk(decoded.id)

        if (!user) {
            return res.status(401).json({ message: "User không tồn tại!" })
        }

        const userSafe = user.toJSON() 
        delete userSafe.password     

        req.user = userSafe

        next()
    } catch (error) {
        console.error("Lỗi trong middleware bảo vệ:", error.message)
        res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" })
    }
}
