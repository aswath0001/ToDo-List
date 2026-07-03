const db = require('../config/database');

const getAllTasks = async (req, res) => {
    console.log(' GET ALL TASKS CALLED');
    console.log(' User ID:', req.userId);
    
    try {
        const userId = req.userId;
        console.log('Executing query for user:', userId);
        
     
        console.log('Database connection status:', typeof db);
        
        const [tasks] = await db.query(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY id ASC',
            [userId]
        );
        
        console.log(' Tasks found:', tasks.length);
        console.log(' First task:', tasks[0]);
        
        res.json({
            success: true,
            data: tasks,
            userId: userId,
            count: tasks.length,
            message: 'Tasks fetched from database'
        });
    } catch (error) {
        console.error(' Database error:', error);
        console.error(' Error details:', error.message);
        
      
        res.status(500).json({
            success: false,
            message: 'Database error',
            error: error.message,
            stack: error.stack
        });
    }
};
const createTask = async (req, res) => {
    console.log(' Create task for user:', req.userId);
    
    try {
        const { taskName } = req.body;
        const userId = req.userId;
        
        if (!taskName || taskName.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Task name is required'
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
            message: 'Task created successfully'
        });
    } catch (error) {
        console.error(' Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create task',
            error: error.message
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.userId;
        
        const [result] = await db.query(
            'DELETE FROM tasks WHERE id = ? AND user_id = ?',
            [id, userId]
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
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete task',
            error: error.message
        });
    }
};

const test = async (req, res) => {
    console.log(' TEST ROUTE CALLED');
    res.json({ message: 'Test route working!' });
};
const toggleComplete = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.userId;
        const { isCompleted } = req.body;
        
        const [result] = await db.query(
            'UPDATE tasks SET isCompleted = ? WHERE id = ? AND user_id = ?',
            [isCompleted, id, userId]
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
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle task',
            error: error.message
        });
    }
};

module.exports = {
    getAllTasks,
    createTask,
    deleteTask,
    toggleComplete,
    test  
};