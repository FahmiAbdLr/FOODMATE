const userModel = require ('../models/index').user
const jwt = require ('jsonwebtoken');

exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.sendStatus(401); // Unauthorized
        }

        const user = await userModel.findOne({
            where: {
                token: refreshToken
            }
        });

        if (!user) {
            return res.sendStatus(403); // Forbidden
        }

        // Verify the refresh token
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.sendStatus(403); // Forbidden
            }

            const id_user = user.id_user;
            const name = user.name;
            const email = user.email;
            const role = user.role;

            // Create a new access token
            const accessToken = jwt.sign(
                { id_user, name, email, role },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15s' }
            );

            res.json({ accessToken });
        });
    } catch (error) {
        console.log(error);
        return res.sendStatus(500); // Internal Server Error
    }
};