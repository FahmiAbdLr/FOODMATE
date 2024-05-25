const barangModel = require('../models/index').barang;
const path = require('path');
const fs = require('fs');
const Op = require('sequelize').Op;
const upload = require('./upload.image').single('image');

// User
exports.getAllBarang = async (req, res) => {
    let barang = await barangModel.findAll()
    return res.json({
        status: true,
        message: `Semua data Barang berhasil ditampilkan`,
        data: barang
    })
}

// User
exports.searchBarang = async (req, res) => {
    let keyword = req.params.keyword
    barangModel.findAll({
        where: {
            [Op.or]: [ // query untuk mencari data user berdasarkan nama, email atau alamat
                { nama: { [Op.like]: "%" + keyword + "%" } },
                { harga: { [Op.like]: "%" + keyword + "%" } },
                { kategori: { [Op.like]: "%" + keyword + "%" } }
            ],
        },
    })
        .then((result) => { // jika berhasil
            if (result.length > 0) {
                res.status(200).json({
                    success: true,
                    message: `Data Barang dengan keyword: ${keyword} berhasil ditemukan`,
                    data: result,
                });
            } else { // jika data user tidak ditemukan
                res.status(400).json({
                    success: false,
                    message: `Data Barang dengan keyword: ${keyword} tidak ditemukan`,
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
exports.searchBarangById = async (req, res) => {
    let keyword = req.params.keyword
    barangModel.findAll({
        where: {
            id_barang: keyword
        },
    })
        .then((result) => { // jika berhasil
            if (result.length > 0) {
                res.status(200).json({
                    success: true,
                    message: `Data Barang dengan Id: ${keyword} berhasil ditemukan`,
                    data: result,
                });
            } else { // jika data user tidak ditemukan
                res.status(400).json({
                    success: false,
                    message: `Data Barang dengan Id: ${keyword} tidak ditemukan`,
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
exports.addBarang = (req, res) => {
    upload(req, res, async (error) => {
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Nothing to Upload' });
        }

        let newBarang = {
            nama: req.body.nama,
            harga: req.body.harga,
            kategori: req.body.kategori,
            image: req.file.filename, // Simpan nama file yang diunggah
        };

        try {
            let result = await barangModel.create(newBarang);
            return res.status(201).json({
                status: true,
                message: 'Data Barang baru berhasil ditambahkan',
                data: result
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
};

// Admin
exports.updateBarang = (req, res) => {
    upload(req, res, async error => {
        /** check if there are error when upload */
        if (error) {
            return res.json({ message: error })
        }

        let id = req.params.id

        let dataBarang = {
            nama: req.body.nama,
            harga: req.body.harga,
            kategori: req.body.kategori,
            image: req.body.filename
        }

        if (req.file) {
            /** get selected event's data */
            const selectedBarang = await barangModel.findOne({
                where: { id_barang: id }
            })
            const oldImage = selectedBarang.image

            /** prepare path of old image to delete file */
            const pathImage = path.join(__dirname, `../images`, oldImage)

            if (fs.existsSync(pathImage)) {
                /** delete old image file */
                fs.unlink(pathImage, error => console.log(error))
            }

            /** add new image filename to event object */
            dataBarang.image = req.file.filename

        }
        barangModel.update(dataBarang, { where: { id_barang: id } })
            .then(result => {
                return res.json({
                    status: true,
                    message: `Data barang dengan Id: ${id} berhasil diupdate`,
                    result: dataBarang
                })
            })
            .catch(error => {
                return res.json({
                    status: false,
                    message: error.message
                })
            })
    })
}

// Admin
exports.deleteBarang = async (req, res) => {
    const id = req.params.id
    const barang = await barangModel.findOne({ where: { id_barang: id } })
    const oldImage = barang.image
    const pathImage = path.join(__dirname, `../images`, oldImage)

    if (fs.existsSync(pathImage)) {
        fs.unlink(pathImage, error => console.log(error))
    }

    barangModel.destroy({ where: { id_barang: id } })
        .then(result => {
            return res.json({
                status: true,
                message: `Data Barang dengan Id: ${id} berhasil dihapus`
            })
        })
        .catch(error => {
            /** if update's process fail */
            return res.json({
                status: false,
                message: error.message
            })
        })
}