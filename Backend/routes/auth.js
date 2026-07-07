const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

router.post('/register', async (req, res) => {
    console.log(' Register request received');
    console.log(' Body:', req.body);
    
    try {
        const { name, email, password, jobRole } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const [existing] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role, jobRole) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, 'user', jobRole || 'Developer']
        );

        const [user] = await db.query(
            'SELECT id, name, email, role, jobRole FROM users WHERE id = ?',
            [result.insertId]
        );

        const token = jwt.sign(
            { userId: user[0].id, email: user[0].email, role: user[0].role || 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log(' User registered:', email);

        res.status(201).json({
            success: true,
            data: {
                id: user[0].id,
                name: user[0].name,
                email: user[0].email,
                role: user[0].role || 'user',
                jobRole: user[0].jobRole || 'Developer',
                token: token
            },
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});


router.post('/login', async (req, res) => {
    console.log(' Login request received');
    console.log(' Body:', req.body);
    
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

    
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

    
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role || 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('User logged in:', email);

        res.json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                jobRole: user.jobRole || 'Developer',
                token: token
            },
            message: 'Login successful'
        });

    } catch (error) {
        console.error(' Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

module.exports = router;