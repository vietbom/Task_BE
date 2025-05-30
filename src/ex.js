kiem tra date:

import { DataTypes  } from "sequelize";
import sequelize from '../lib/mysql.js';
import { User } from "./User.model.js";

const Task = sequelize.define('Task', {
    titleTask: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    note: {
        type: DataTypes.JSON,
        defaultValue: []

    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    priority: {
        type: DataTypes.ENUM("Low", "Medium", "High"),
        defaultValue: "Medium"
    },
    startDate: {
        type: DataTypes.STRING,
    },
    dueDate: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.ENUM("active", "expired", "done"),
        defaultValue: "active"
    }
},{
    timestamps: true
})

Task.belongsTo(User, {foreignKey: 'userId', onDelete: 'CASCADE'})
User.hasMany(Task, {foreignKey: 'userId'})

export {Task}

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

frontend:


import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isSameDay, isSameMonth, startOfMonth, subMonths, isWithinInterval } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { useTaskStore } from "../../apis/Task"
import { useAuthStore } from "../../apis/Auth"
import { useNavigate } from "react-router-dom"
import DetailTask from "./DetailTask"
import type { Task } from "../../apis/Task"

const HomeTask: React.FC = () => {
    const { user } = useAuthStore()
    const { getTask, tasks, deleteTask } = useTaskStore()
    const [hoveredTaskId, setHoveredTaskId] = useState<number | null>(null)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const startDay = getDay(monthStart)
    const emptyDays = Array.from({ length: startDay === 0 ? 6 : startDay - 1 }, () => null)

    const navigate = useNavigate()
    useEffect(() => {
        if (user?.id) {
            getTask(user.id.toString())
        }
    }, [user, getTask])

    const goToPreviousMonth = () => {
        setCurrentDate(subMonths(currentDate, 1))
    }
    const goToNextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1))
    }
    const goToCurrentMonth = () => {
        setCurrentDate(new Date())
    }

    const startOfDay = (date: Date) => new Date(date.setHours(0, 0, 0, 0))
    const endOfDay = (date: Date) => new Date(date.setHours(23, 59, 59, 999))

    // const startOfDay = (date: Date | string) => {
    //     const d = typeof date === "string" ? new Date(date) : date;
    //     return new Date(d.setHours(0, 0, 0, 0));
    // }

    // const endOfDay = (date: Date | string) => {
    //     const d = typeof date === "string" ? new Date(date) : date;
    //     return new Date(d.setHours(23, 59, 59, 999));
    // }

    const handleDeleteTask = (taskId: number) => {
        if (!user?.id) return
        deleteTask(user.id.toString(), taskId.toString())
    }

    return (
        <div className="container mx-auto py-8 px-6 flex-1">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={goToPreviousMonth} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
                        <ChevronLeft size={15} />
                    </button>
                    <button onClick={goToCurrentMonth} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
                        Today
                    </button>
                    <button onClick={goToNextMonth} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
                        <ChevronRight size={15} />
                    </button>
                </div>

                <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')} | Planner</h2>

                <button 
                    onClick={() => navigate('/user/addTask')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    <Plus size={18} />
                    Add Task
                </button>
            </div>

            <div className="overflow-hidden">
                <div className="grid grid-cols-7 border-b border-r-gray-700">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <div
                            key={day}
                            className="p-3 text-center font-medium text-gray-600 bg-green-200 border-r border-gray-500 last:border-r-0"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {emptyDays.map((_, index) => (
                        <div key={`empty-${index}`} className="h-32 border-r border-b border border-gray-500 bg-gray-50"></div>
                    ))}

                    {calendarDays.map((day) => {
                        const isToday = isSameDay(day, new Date())

                        const tasksForDay = tasks.filter((task) => {
                            if (!task.startDate || !task.dueDate) return false

                            const start = startOfDay(task.startDate)
                            const due = endOfDay(task.dueDate)

                            return isWithinInterval(day, { start, end: due })
                        })

                        const isTaskStart = (task: Task) => isSameDay(startOfDay(task.startDate), day)
                        const isTaskEnd = (task: Task) => isSameDay(endOfDay(task.dueDate), day)

                        return (
                            <div
                            key={day.toISOString()}
                            onDoubleClick={() => {
                            const localDate = day.toLocaleDateString("sv-SE")
                            navigate(`/user/addTask?date=${localDate}`) }}                            
                            className={`h-32 border-r border border-gray-500 last:border-r-0 p-1 overflow-hidden
                                ${!isSameMonth(day, currentDate) ? 'bg-gray-50' : 'bg-white'}`}
                            >
                            <div
                                className={`text-sm font-medium mb-1 ${
                                isToday
                                    ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    : !isSameMonth(day, currentDate)
                                    ? "text-gray-400"
                                    : "text-gray-900"
                                }`}
                            >
                                {format(day, 'd')}
                            </div>

                            <div className="space-y-1">
                                {tasksForDay.slice(0, 5).map((task) => {
                                    const start = isTaskStart(task)
                                    const end = isTaskEnd(task)

                                    const bgColor =
                                        task.completed
                                            ? 'bg-blue-500'
                                            : task.priority === 'High'
                                            ? 'bg-red-500'
                                            : task.priority === 'Medium'
                                            ? 'bg-orange-400'
                                            : 'bg-green-500'
                                    return (
                                        <div
                                            key={`${task.id}-${day.toISOString()}`}
                                            className={`${bgColor} text-white text-xs px-1 py-0.5 truncate flex justify-between items-center
                                                ${
                                                start && end
                                                    ? "rounded"
                                                    : start
                                                    ? "rounded-l"
                                                    : end
                                                    ? "rounded-r"
                                                    : ""
                                                }`}
                                            title={task.titleTask || ""}
                                            onClick={() => setSelectedTask(task)}                                            
                                            onMouseEnter={() => setHoveredTaskId(Number(task.id))}
                                            onMouseLeave={() => setHoveredTaskId(null)}
                                        >
                                        {start ? task.titleTask : ""}
                                        {hoveredTaskId === Number(task.id) && (
                                            <button
                                                onClick={() => handleDeleteTask(Number(task.id))}
                                                className="ml-2 text-white hover:text-red-300"
                                                title="Delete task"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                        </div>
                                    )
                                })}

                                {tasksForDay.length > 4 && (
                                <div className="text-xs text-gray-500">+{tasksForDay.length - 4} more</div>
                                )}
                            </div>
                        </div>
                        )
                    })}
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-sm">Medium Priority</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Low Priority</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm">Success</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-600 rounded"></div>
                    <span className="text-sm">Expired Task</span>
                </div>
            </div>
            {selectedTask && (
                <DetailTask task={selectedTask} onClose={() => setSelectedTask(null)} />
            )}

        </div>
    )
}

export default HomeTask
