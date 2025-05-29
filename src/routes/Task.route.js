import express from "express";
import { addNote, completedTask, createTask, deleteTask, expiredTask, getTask } from "../controllers/Task.controllers.js";

const taskRouter = express.Router()

taskRouter.post('/createTask/:userId', createTask)
taskRouter.get('/getTask/:userId', getTask)
taskRouter.delete('/delTask/:userId/:taskId', deleteTask)


taskRouter.post('/completedTask/:userId/:taskId', completedTask)
taskRouter.post('/exTask/:userId/:taskId', expiredTask)
taskRouter.post('/noteTask/:userId/:taskId', addNote)

export default taskRouter