const userModel = require('../models/index').user;
const jwt = require('jsonwebtoken');

const checkRole = (allowedRoles) => {
    return async (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token == null) {
            return res.status(401).json({ message: 'Token tidak ditemukan' });
        }

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await userModel.findOne({ where: { id_user: decoded.id_user } });

            if (!user) {
                return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
            }

            if (allowedRoles.includes(user.role)) {
                req.user = user; // Menyimpan data user dalam request object untuk digunakan nanti
                next();
            } else {
                return res.status(403).json({ message: 'Akses ditolak. Hanya Admin yang bisa mengakses' });
            }
        } catch (error) {
            return res.status(403).json({ message: 'Token tidak valid / kadaluwarsa' });
        }
    };
};

module.exports = { checkRole };
