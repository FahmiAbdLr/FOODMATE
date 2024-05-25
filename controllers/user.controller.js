const userModel = require('../models/index').user;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Op = require('sequelize').Op;

// User
exports.Register = async (req, res) => {
    const { nama, alamat, email, password } = req.body;
    const role = 'user';
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt)
    if (nama == '' || alamat == '' || email == '' || password == '') {
        return res.status(400).json({
            message: 'Harap memasukkan semua data'
        })
    }
    const existingUser = await Promise.all([
        userModel.findOne({ where: { email: email } }),
        userModel.findOne({ where: { nama: nama } })
    ]);
    if (existingUser[0]) {
        return res.status(400).json({
            success: false,
            message: 'Email sudah digunakan'
        });
    }
    if (existingUser[1]) {
        return res.status(400).json({
            success: false,
            message: 'Nama sudah digunakan'
        });
    }
    let dataUser = {
        nama: nama,
        alamat: alamat,
        email: email,
        password: hashPassword,
        role: role
    }
    try {
        await userModel.create(dataUser);
        return res.json({
            success: true,
            message: `Data Pengguna baru berhasil ditambahkan`,
            data: dataUser,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

// User
exports.updateUser = async (request, response) => {
    try {
        let id = request.params.id;
        let user = await userModel.findOne({
            where: {
                id_user: id,
            },
        });

        if (!user) {
            return response.status(400).json({
                success: false,
                message: "User dengan ID tersebut tidak ada",
            });
        }

        if (user.role == 'admin') {
            return response.status(400).json({
                success: false,
                message: "User dengan ID merupakan admin",
            });
        }

        let dataUser = {
            nama: request.body.nama,
            email: request.body.email,
            alamat: request.body.alamat
        };

        if (dataUser.nama === "" || dataUser.email === "" || dataUser.alamat === "") {
            return response.status(400).json({
                success: false,
                message: "Harap mengisi semua data. Apabila tidak ingin mengubah, isi dengan nilai sebelumnya.",
            });
        }

        // Cek apakah nama_pengguna atau email sudah digunakan oleh pengguna lain
        let existingUser = await userModel.findOne({
            where: {
                [Op.and]: [
                    { id_user: { [Op.ne]: id } },
                    {
                        [Op.or]: [
                            { nama: dataUser.nama },
                            { email: dataUser.email },
                            { alamat: dataUser.alamat }
                        ],
                    },
                ],
            },
        });

        if (existingUser) { // jika data sudah digunakan
            return response.status(400).json({
                success: false,
                message: "Nama pengguna atau Email sudah digunakan",
            });
        }

        // Update pengguna
        await userModel.update(dataUser, { where: { id_user: id } });
        return response.json({
            success: true,
            message: `Data pengguna dengan id: ${id} berhasil diupdate`,
        });
    } catch (error) {
        return response.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// User or Admin
exports.Login = async (req, res) => {
    try {
        const user = await userModel.findOne({
            where: {
                email: req.body.email
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Email tidak ditemukan'
            });
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) {
            return res.status(400).json({
                success: false,
                message: 'Password salah'
            });
        }

        const id_user = user.id_user;
        const nama = user.nama;
        const email = user.email;
        const role = user.role;
        const accessToken = jwt.sign({ id_user, nama, email, role }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '20s'
        });
        const refreshToken = jwt.sign({ id_user, nama, email, role }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });

        await userModel.update({ token: refreshToken }, {
            where: {
                id_user: id_user
            }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.json({
            success: true,
            message: 'Anda berhasil login',
            data: { nama: nama, email: email, role: role },
            accessToken: accessToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// User or Admin
exports.Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.sendStatus(204);
    }
    const user = await userModel.findAll({
        where: {
            token: refreshToken
        }
    });
    if (!user) {
        return res.sendStatus(204);
    }
    const id_user = user.id_user
    await userModel.update({ token: null }, {
        where: {
            id_user: id_user
        }
    });
    res.clearCookie('refreshToken')
    return res.sendStatus(200);
}

// User or Admin
exports.resetPasswordUser = async (req, res) => {
    try {
        const id = req.params.id;
        const findUser = await userModel.findOne({ where: { id_user: id } });

        if (!findUser) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }

        const passwordLama = req.body.passwordLama;
        const passwordBaru = req.body.passwordBaru;
        if (passwordBaru === passwordLama) {
            return res.status(400).json({
                success: false,
                message: "Password sudah pernah digunakan"
            });
        }

        const match = await bcrypt.compare(passwordLama, findUser.password);

        if (match) {
            const salt = await bcrypt.genSalt();
            const hashPassword = await bcrypt.hash(passwordBaru, salt);

            await userModel.update({ password: hashPassword }, { where: { id_user: id } });

            return res.json({
                success: true,
                message: `Password User dengan id: ${id} berhasil diupdate`
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Password lama tidak cocok, silahkan coba lagi"
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin
exports.getUser = async (req, res) => {
    try {
        const user = await userModel.findAll({
            attributes: ['id_user', 'nama', 'alamat', 'email', 'role']
        });
        return res.json({
            message: 'Semua data User berhasil ditampilkan',
            data: user
        })
    } catch (error) {
        console.log(error)
    }
}

// Admin
exports.searchUser = async (req, res) => {
    let keyword = req.params.keyword
    userModel.findAll({
        where: {
            [Op.or]: [ // query untuk mencari data user berdasarkan nama, email atau alamat
                { nama: { [Op.like]: "%" + keyword + "%" } },
                { email: { [Op.like]: "%" + keyword + "%" } },
                { alamat: { [Op.like]: "%" + keyword + "%" } }
            ],
        },
    })
        .then((result) => { // jika berhasil
            if (result.length > 0) {
                res.status(200).json({
                    success: true,
                    message: `Data User dengan keyword: ${keyword} berhasil ditemukan`,
                    data: result,
                });
            } else { // jika data user tidak ditemukan
                res.status(400).json({
                    success: false,
                    message: `Data User dengan keyword: ${keyword} tidak ditemukan`,
                });
            }
        })
        .catch((error) => { // jika gagal
            res.status(400).json({
                success: false,
                message: error.message,
            });
        });
}

// Admin
exports.findOnlyUser = async (req, res) => {
    let user = await userModel.findAll({ where: { role: 'user' } }); // mencari user dengan role "user" saja
    if (user.length === 0) { // kalau tidak ada
        return res.status(400).json({
            success: false,
            message: "Tidak ada data User untuk ditampilkan",
        });
    } else { // kalau ada
        return res.json({
            success: true,
            message: `Semua data User berhasil ditampilkan`,
            data: user
        });
    }
}

// Admin
exports.findOnlyAdmin = async (req, res) => {
    let admin = await userModel.findAll({ where: { role: "admin" } }); // mencari user yang role nya admin
    if (admin.length === 0) { // kalau ga ada
        return res.status(400).json({
            success: false,
            message: "Tidak ada data Admin untuk ditampilkan",
        });
    } else { // kalau ada
        return res.json({
            success: true,
            data: admin,
            message: `Semua data Admin berhasil ditampilkan`,
        });
    }
}

// Admin
exports.updateAdmin = async (req, res) => {
    try {
        let id = req.params.id;
        let user = await userModel.findOne({
            where: {
                id_user: id,
            },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User dengan ID tersebut tidak ada",
            });
        }

        let dataUser = {
            nama: req.body.nama,
            email: req.body.email,
            alamat: req.body.alamat
        };

        if (dataUser.nama === "" || dataUser.email === "" || dataUser.alamat === "") {
            return res.status(400).json({
                success: false,
                message: "Harap mengisi semua data. Apabila tidak ingin mengubah, isi dengan nilai sebelumnya.",
            });
        }

        // Cek apakah nama_pengguna atau email sudah digunakan oleh pengguna lain
        let existingUser = await userModel.findOne({
            where: {
                [Op.and]: [
                    { id_user: { [Op.ne]: id } },
                    {
                        [Op.or]: [
                            { nama: dataUser.nama },
                            { email: dataUser.email },
                            { alamat: dataUser.alamat }
                        ],
                    },
                ],
            },
        });

        if (existingUser) { // jika data sudah digunakan
            return res.status(400).json({
                success: false,
                message: "Nama pengguna atau Email sudah digunakan",
            });
        }

        // Update pengguna
        await userModel.update(dataUser, { where: { id_user: id } });
        return res.json({
            success: true,
            message: `Data pengguna dengan id: ${id} berhasil diupdate`,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Admin
exports.deleteUser = async (req, res) => {
    let id = req.params.id; // cari user berdasarkan ID 

    userModel.destroy({ where: { id_user: id } })
        .then((result) => {
            return res.json({
                success: true,
                message: `Data User dengan ID: ` + id + ' berhasil dihapus'
            });
        })
        .catch((error) => {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        });
}