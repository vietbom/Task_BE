import { Task } from "../model/Task.model.js"
import { User } from "../model/User.model.js"
import {format, parse} from 'date-fns'
export const createTask = async (req, res) => {
    const { userId } = req.params;
    const { titleTask, description, completed, priority, startDate, dueDate, note } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User không tồn tại" });
        }

        if (!titleTask) {
            return res.status(400).json({ message: "titleTask là bắt buộc" });
        }

        const parsedStartDate = parse(startDate, 'dd-MM-yyyy', new Date())
        const parsedDueDate = parse(dueDate, 'dd-MM-yyyy', new Date())

        const formattedStartDate = format(parsedStartDate, 'yyyy-MM-dd')
        const formattedDueDate = format(parsedDueDate, 'yyyy-MM-dd')

        const newTask = await Task.create({
            titleTask,
            description,
            completed: completed || false,
            priority: priority || 'Medium',
            startDate: formattedStartDate,
            dueDate: formattedDueDate,
            note: note || [],
            userId,
        });

        res.status(201).json({
            message: "Tạo task thành công",
            task: newTask,
        });

    } catch (error) {
        console.error("Lỗi trong createTask:", error.message);
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" });
    }
};

export const getTask = async(req, res ) => {
    const {userId} = req.params
    try {
        const user = await User.findByPk(userId)
        if (!user) {
            return res.status(404).json({ message: "User không tồn tại" })
        }
        const tasks = await Task.findAll({where: {userId}})

        res.status(200).json({
            message: "Lấy danh sách task thành công",
            tasks
        })
    } catch (error) {
        console.error("Lỗi trong getTask:", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
    
}

export const completedTask = async(req, res ) => {
    const {userId , taskId} = req.params
    try {
        const user = User.findByPk(userId)
        if (!user) {
            return res.status(404).json({ message: "User không tồn tại" })
        }
        const task = await Task.findByPk(taskId)
        if(!task){
            return res.status(404).json({message: 'Không tìm thấy nhiệm vụ'})
        }
        if(task.userId != userId){
            return res.status(403).json({ message: "Bạn không có quyền xóa task này" })
        }

        task.completed=true
        task.status='done'
        task.save()

        res.status(200).json({ message: "Đã đánh dấu hoàn thành task", task })
    } catch (error) {
        console.error("Lỗi trong completeTask:", error.message)
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" })
    }
}

export const expiredTask = async (req, res) => {
    const { userId, taskId } = req.params

    try {
        const user = await User.findByPk(userId)
        if (!user) {
            return res.status(404).json({ message: "User không tồn tại" })
        }

        const task = await Task.findByPk(taskId)
        if (!task) {
            return res.status(404).json({ message: "Không tìm thấy nhiệm vụ" })
        }

        if (task.userId != userId) {
            return res.status(403).json({ message: "Bạn không có quyền cập nhật task này" })
        }

        const isExpired = task.dueDate && new Date(task.dueDate) < new Date()
        if (!task.completed && isExpired) {
            task.status = 'expired'
            await task.save()

            return res.status(200).json({
                message: "Task đã hết thời gian",
                nameTask: task.titleTask
            })
        }else if (task.completed) {
            return res.status(400).json({ message: "Task đã hoàn thành" }) 
        }
        else{
            return res.status(400).json({ message: "Task vẫn còn hạn" })
        }

    } catch (error) {
        console.error("Lỗi trong expiredTask:", error.message)
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" })
    }
}

export const deleteTask = async(req, res ) => {
    const {userId, taskId }= req.params
    try {
        const user = await User.findByPk(userId)
        if (!user) {
            return res.status(404).json({ message: "User không tồn tại" })
        }
        const task = await Task.findByPk(taskId)
        if(!task){
            return res.status(404).json({message: 'Không tìm thấy nhiệm vụ'})
        }
        if(task.userId != userId){
            return res.status(403).json({ message: "Bạn không có quyền xóa task này" })
        }

        await task.destroy()

        res.status(200).json({ message: "Xóa task thành công" })
    } catch (error) {
        console.error("Lỗi trong deleteTask:", error.message)
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" })
    }
}

export const addNote = async (req, res) => {
    const { userId, taskId } = req.params;
    const { note } = req.body;

    try {
        if (!note) {
            return res.status(400).json({ message: 'Note không được để trống!' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User không tồn tại" });
        }

        const task = await Task.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Không tìm thấy nhiệm vụ' });
        }

        if (task.userId != userId) {
            return res.status(403).json({ message: "Bạn không có quyền note task này" });
        }

        let currentNotes = [];

        if (Array.isArray(task.note)) {
            currentNotes = task.note;
        } else if (typeof task.note === 'string') {
            try {
                const parsed = JSON.parse(task.note);
                if (Array.isArray(parsed)) {
                    currentNotes = parsed;
                } else {
                    currentNotes = [task.note];
                }
            } catch {
                currentNotes = [task.note];
            }
        } else if (typeof task.note === 'object' && task.note !== null) {
            currentNotes = Object.values(task.note);
        }


        currentNotes.push(note);
        task.note = currentNotes;
        await task.save();

        res.status(200).json({
            message: "Đã thêm note thành công vào task",
            note: task.note
        });

    } catch (error) {
        console.error("Lỗi trong noteTask:", error.message);
        res.status(500).json({ message: "Lỗi Máy Chủ Nội Bộ" });
    }
}
