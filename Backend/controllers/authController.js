const login = async (req, res) => {
      console.log('📦 Request body received:', req.body);
    try {
        const { email, password } = req.body;
        console.log('📧 Login attempt:', email, password);

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
        console.log('👤 User found:', user.email, 'Role:', user.role);

        // ✅ For testing - compare plain password
        if (password !== user.password) {
            // For hashed password testing, use bcrypt
            // const isValid = await bcrypt.compare(password, user.password);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role || 'user' },
            process.env.JWT_SECRET || 'mysecretkey',
            { expiresIn: '7d' }
        );

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
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};