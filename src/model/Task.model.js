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
        type: DataTypes.DATE,
    },
    dueDate: {
        type: DataTypes.DATE,
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