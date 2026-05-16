module.exports = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ status: "Error", msg: "Forbidden: You don't have permission to access this resource", code:403, data:null });
        }
        next();
    }
    
}