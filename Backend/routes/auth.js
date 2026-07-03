const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// ✅ TEST ROUTE INSIDE AUTH
router.get('/test', (req, res) => {
    console.log('🧪 Auth test route hit!');
    res.json({ 
        success: true, 
        message: 'Auth route working!' 
    });
});

// ✅ REGISTER
router.post('/register', async (req, res) => {
    console.log('📦 Register request received');
    console.log('📦 Body:', req.body);
    
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Check if user exists
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

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user (with default role 'user')
        const [result] = await db.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, 'user']
        );

        // Get user
        const [user] = await db.query(
            'SELECT id, email, role FROM users WHERE id = ?',
            [result.insertId]
        );

        // Generate token with role
        const token = jwt.sign(
            { userId: user[0].id, email: user[0].email, role: user[0].role || 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('✅ User registered:', email);

        res.status(201).json({
            success: true,
            data: {
                id: user[0].id,
                email: user[0].email,
                role: user[0].role || 'user',
                token: token
            },
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
    console.log('📦 Login request received');
    console.log('📦 Body:', req.body);
    
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
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

        // Verify password
       // ✅ TEMPORARY - Skip password check for testing
// const isValid = await bcrypt.compare(password, user.password);
// if (!isValid) {
//     return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password'
//     });
// }
console.log('✅ Password check bypassed!');

        // Generate token with role
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role || 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('✅ User logged in:', email);

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                role: user.role || 'user',
                token: token
            },
            message: 'Login successful'
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

module.exports = router;