const jwt = require('jsonwebtoken')


const verifyAdmin = (req, res, next) => {
    let token = req.headers.authorization;
    token     = token.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        if (!decoded.isAdmin) {
            return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
        }

        next();
    });
};

module.exports = verifyAdmin