const db = require('../config/database');

class UserModel {
    static async findByEmail(email) {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async createUser(email, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, 'user']
        );
        return result.insertId;
    }

    static async getById(id) {
        const [rows] = await db.query(
            'SELECT id, email, role, createdAt FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

  
    static async getAllUsers() {
        const [rows] = await db.query(
            'SELECT id, email, role, createdAt FROM users ORDER BY id DESC'
        );
        return rows;
    }


    static async getUserById(id) {
        const [rows] = await db.query(
            'SELECT id, email, role, createdAt FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }
}

module.exports = UserModel;