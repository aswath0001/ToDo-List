const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

// ✅ All routes require authentication
router.use(authenticate);

// ✅ GET /api/tasks - should call getAllTasks
router.get('/', taskController.getAllTasks);

// ✅ POST /api/tasks - create task
router.post('/', taskController.createTask);

// ✅ DELETE /api/tasks/:id - delete task
router.delete('/:id', taskController.deleteTask);

// ✅ PATCH /api/tasks/:id/toggle - toggle complete
router.patch('/:id/toggle', taskController.toggleComplete);
router.get('/test', taskController.test);
module.exports = router;