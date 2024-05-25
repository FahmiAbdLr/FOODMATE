const jwt = require(`jsonwebtoken`);

const authVerify = async (req, res, next) => {
    try {
        const header = req.headers.authorization; // minta token
        if (header == null) {  // kalo ga ada token
            return res.status(400).json({
                message: "Tidak ada token"
            })
        }

        let token = header.split(" ")[1]; // ambil token dari bearer token, ambil elemen kedua
        let decodedToken;
        try {
            decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // verifikasi token pake secret key
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) { //kalo tokennya kadaluwarsa
                return res.status(400).json({
                    message: "Token Expired",
                });
            }
            return res.status(400).json({
                message: "Token Invalid",
            });
        }

        req.email = decodedToken; //nyimpen data user
        next();

    }
    catch (error) {
        console.log(error);
        return res.status(400).json({
            message: error,
        })
    }
}
module.exports = { authVerify };