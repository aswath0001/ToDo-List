const db = require('../config/database');
const UserModel = require('../models/userModel');


const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.getAllUsers();
        res.json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

const getAllTasks = async (req, res) => {
    try {
        const [tasks] = await db.query(
            `SELECT t.*, u.email as userEmail 
             FROM tasks t 
             JOIN users u ON t.user_id = u.id 
             ORDER BY t.id DESC`
        );
        res.json({
            success: true,
            data: tasks,
            count: tasks.length
        });
    } catch (error) {
        console.error('Error fetching all tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks',
            error: error.message
        });
    }
};


const getTasksByUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const [tasks] = await db.query(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC',
            [userId]
        );
        res.json({
            success: true,
            data: tasks,
            count: tasks.length
        });
    } catch (error) {
        console.error('Error fetching user tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user tasks',
            error: error.message
        });
    }
};


const assignTask = async (req, res) => {
    try {
        const { userId, taskName } = req.body;
        
        if (!userId || !taskName || taskName.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'User ID and task name are required'
            });
        }

    
        const user = await UserModel.getUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const [result] = await db.query(
            'INSERT INTO tasks (user_id, taskName) VALUES (?, ?)',
            [userId, taskName.trim()]
        );

        const [newTask] = await db.query(
            'SELECT * FROM tasks WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            data: newTask[0],
            message: 'Task assigned successfully'
        });
    } catch (error) {
        console.error('Error assigning task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign task',
            error: error.message
        });
    }
};


const deleteTask = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        const [result] = await db.query(
            'DELETE FROM tasks WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete task',
            error: error.message
        });
    }
};


const toggleTask = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { isCompleted } = req.body;
        
        const [result] = await db.query(
            'UPDATE tasks SET isCompleted = ? WHERE id = ?',
            [isCompleted, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        const [updatedTask] = await db.query(
            'SELECT * FROM tasks WHERE id = ?',
            [id]
        );
        
        res.json({
            success: true,
            data: updatedTask[0],
            message: 'Task status updated'
        });
    } catch (error) {
        console.error('Error toggling task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle task',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getAllTasks,
    getTasksByUser,
    assignTask,
    deleteTask,
    toggleTask
};