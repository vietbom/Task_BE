import { generateToken } from "../lib/utils.js"
import { User } from "../model/User.model.js"
import bcrypt from "bcryptjs"

export const signUp = async (req, res) => {
    const { userName, email, password } = req.body

    try {
        if (!userName || userName.trim() === "") {
            return res.status(400).json({ message: "Tên người dùng là bắt buộc!" })
        }

        if (!email || email.trim() === "") {
            return res.status(400).json({ message: "Email là bắt buộc!" })
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" })
        }

        const existingUser = await User.findOne({
            where: {
                email: String(email),
            },
        })

        if (existingUser) {
            return res.status(400).json({ message: "Email đã tồn tại. Vui lòng chọn email khác!" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await User.create({
            userName,
            email,
            password: hashedPassword,
        })

        generateToken(newUser.id, res)

        res.status(201).json({
            userId: newUser.id,
            userName: newUser.userName,
            email: newUser.email,
        })
    } catch (error) {

        console.error("Lỗi trong signup:", error.errors || error.message || error)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}


export const signIn = async(req, res) => {
    const {email, password} = req.body
    try {
        if(!email || !password){
            return res.status(400).json({message: 'Email và mật khẩu là thông tin bắt buộc! '})
        }
        const user = await User.findOne({where: {email: String(email)}})
        if(!user){
            return res.status(400).json({message: 'Tài khoản không tồn tại! ' })
        }
        const isPasswordcorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordcorrect){
            return res.status(401).json({ message: "Nhập mật khẩu không chính xác! " })
        }
        generateToken(user.id, res)
        res.status(200).json({
            userId: user.id,
            userName: user.userName,
            email: user.email,
        })

    } catch (error) {
        console.error("Lỗi trong signIn:", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}

export const logout = async(req, res ) => {
    try {
        const isDevelopment = process.env.NODE_ENV === 'development'
        res.cookie('jwt','', {
            maxAge: 0,
            httpOnly: true,
            sameSite: 'Lax',
            secure: !isDevelopment,
            path: '/'
        })
        return res.status(200).json({ message: "Đăng xuất thành công" })
    } catch (error) {
        console.error("Lỗi trong logout controller:", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}

export const checkAuth  = async(req, res ) => {
    try {
        if(!req.user){
            return res.status(401).json({ message: "Unauthorized - User context not found" })
        }
        res.status(200).json(req.user)
    } catch (error) {
        console.error("Lỗi trong checkAuth controller:", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}