const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');


router.use(authenticate);
router.use(isAdmin);


router.get('/users', async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, email, role, createdAt FROM users ORDER BY id ASC'
        );
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
});


router.get('/tasks', async (req, res) => {
    try {
        const [tasks] = await db.query(
            `SELECT t.*, u.email as userEmail 
             FROM tasks t 
             JOIN users u ON t.user_id = u.id 
             ORDER BY t.id ASC`
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
});


router.get('/tasks/user/:userId', async (req, res) => {
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
});


router.post('/assign-task', async (req, res) => {
    try {
        const { userId, taskName } = req.body;
        
        if (!userId || !taskName || taskName.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'User ID and task name are required'
            });
        }

       
        const [users] = await db.query(
            'SELECT id FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
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
});


router.delete('/task/:id', async (req, res) => {
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
});
// ✅ Set In Progress
router.patch('/task/:id/inprogress', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { isInProgress } = req.body;
        
        const [result] = await db.query(
            'UPDATE tasks SET isInProgress = ? WHERE id = ?',
            [isInProgress, id]
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
            message: 'Failed to update task',
            error: error.message
        });
    }
});

router.patch('/task/:id/toggle', async (req, res) => {
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
});

module.exports = router;