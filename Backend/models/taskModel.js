const db = require('../config/database');

class TaskModel {

    static async getAllTasks(userId) {
        const [rows] = await db.query(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC',
            [userId]
        );
        return rows;
    }


    static async getCompletedTasks(userId) {
        const [rows] = await db.query(
            'SELECT * FROM tasks WHERE user_id = ? AND isCompleted = TRUE ORDER BY id DESC',
            [userId]
        );
        return rows;
    }


    static async getUncompletedTasks(userId) {
        const [rows] = await db.query(
            'SELECT * FROM tasks WHERE user_id = ? AND isCompleted = FALSE ORDER BY id DESC',
            [userId]
        );
        return rows;
    }

    static async getTaskById(id, userId) {
        const [rows] = await db.query(
            'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return rows[0];
    }


    static async createTask(userId, taskName) {
        const [result] = await db.query(
            'INSERT INTO tasks (user_id, taskName) VALUES (?, ?)',
            [userId, taskName]
        );
        return result.insertId;
    }


    static async updateTask(id, userId, taskName, isCompleted) {
        const [result] = await db.query(
            'UPDATE tasks SET taskName = ?, isCompleted = ? WHERE id = ? AND user_id = ?',
            [taskName, isCompleted, id, userId]
        );
        return result.affectedRows;
    }

    static async deleteTask(id, userId) {
        const [result] = await db.query(
            'DELETE FROM tasks WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return result.affectedRows;
    }

  
    static async toggleComplete(id, userId, isCompleted) {
        const [result] = await db.query(
            'UPDATE tasks SET isCompleted = ? WHERE id = ? AND user_id = ?',
            [isCompleted, id, userId]
        );
        return result.affectedRows;
    }
    // Create task with isInProgress
static async createTask(userId, taskName) {
    const [result] = await db.query(
        'INSERT INTO tasks (user_id, taskName, isInProgress) VALUES (?, ?, ?)',
        [userId, taskName, false]
    );
    return result.insertId;
}


static async updateTask(id, userId, taskName, isCompleted, isInProgress) {
    const [result] = await db.query(
        'UPDATE tasks SET taskName = ?, isCompleted = ?, isInProgress = ? WHERE id = ? AND user_id = ?',
        [taskName, isCompleted, isInProgress, id, userId]
    );
    return result.affectedRows;
}


static async toggleComplete(id, userId, isCompleted) {
    const [result] = await db.query(
        'UPDATE tasks SET isCompleted = ?, isInProgress = ? WHERE id = ? AND user_id = ?',
        [isCompleted, false, id, userId]
    );
    return result.affectedRows;
}
}

module.exports = TaskModel;