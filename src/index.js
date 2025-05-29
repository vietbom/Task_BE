import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"
import userRouter from './routes/User.routes.js'
import sequelize from './lib/mysql.js'
import taskRouter from './routes/Task.route.js'


const ENV = process.env.NODE_ENV || 'development'
dotenv.config({ path: `.env.${ENV}` })

const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))

sequelize.sync()
const port = process.env.APP_PORT 
const host = process.env.APP_HOSTNAME || 'localhost'


console.log("ENV:", process.env.NODE_ENV)
console.log("DB:", process.env.DATABASE_URL)


app.use('/user', userRouter)
app.use('/task', taskRouter)
app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`)
})