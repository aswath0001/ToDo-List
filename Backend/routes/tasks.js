const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', taskController.getAllTasks);

router.post('/', taskController.createTask);

router.patch('/:id/inprogress', taskController.setInProgress);

router.delete('/:id', taskController.deleteTask);

router.patch('/:id/toggle', taskController.toggleComplete);
router.get('/test', taskController.test);
module.exports = router;