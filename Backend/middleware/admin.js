// Middleware to verify if user is admin
const isAdmin = (req, res, next) => {
    console.log(' User Role:', req.userRole);
    
    if (req.userRole !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }
    
    next();
};

module.exports = { isAdmin };