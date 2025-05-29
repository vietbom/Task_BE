import express from 'express'
import { checkAuth, logout, signIn, signUp } from '../controllers/User.controllers.js'
import { protectRoute } from '../midleware/auth.midleware.js'

const userRouter = express.Router()

userRouter.post('/signUp', signUp)
userRouter.post('/signIn', signIn)
userRouter.post('/logout', logout)

userRouter.get('/checkAuth', protectRoute, checkAuth)
export default userRouter