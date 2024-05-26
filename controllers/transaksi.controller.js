const { transaksi: transaksiModel, detail_transaksi: detailTransaksiModel, barang: barangModel, user: userModel } = require('../models');

const addTransaksi = async (req, res) => {
    const { id_user, nama_pemesan, metodePay, details } = req.body;

    try {
        // Hitung total transaksi berdasarkan details
        let totalTransaksi = 0;
        const detailTransaksiPromises = details.map(async (detail) => {
            const itemBarang = await barangModel.findOne({
                where: {
                    id_barang: detail.id_barang
                }
            });
            if (!itemBarang) {
                throw new Error(`Barang with id ${detail.id_barang} not found`);
            }
            totalTransaksi += detail.qyt * itemBarang.harga;

            return {
                id_barang: detail.id_barang,
                qyt: detail.qyt,
                total: detail.qyt * itemBarang.harga
            };
        });

        const detailTransaksiData = await Promise.all(detailTransaksiPromises);

        // Buat transaksi baru
        const newTransaksi = await transaksiModel.create({
            id_user,
            nama_pemesan,
            metodePay
        });

        // Buat detail transaksi
        await Promise.all(
            detailTransaksiData.map(detail => {
                return detailTransaksiModel.create({
                    id_transaksi: newTransaksi.id_transaksi,
                    id_barang: detail.id_barang,
                    qyt: detail.qyt,
                    total: detail.total
                });
            })
        );

        res.status(201).json({ message: 'Transaksi created successfully', newTransaksi });
    } catch (error) {
        res.status(500).json({ message: 'Error creating transaksi', error: error.message });
    }
};

const getTransaksi = async (req, res) => {
    try {
        // Ambil semua transaksi
        const transaksis = await transaksiModel.findAll();

        // Data transaksi yang akan dikirim sebagai respons
        const transaksiData = [];

        // Loop melalui setiap transaksi
        for (const transaksi of transaksis) {
            // Temukan detail transaksi untuk transaksi saat ini
            const detailTransaksis = await detailTransaksiModel.findAll({
                where: { id_transaksi: transaksi.id_transaksi }
            });

            // Buat objek transaksi
            const transaksiInfo = {
                id_transaksi: transaksi.id_transaksi,
                id_user: transaksi.id_user,
                nama_pemesan: transaksi.nama_pemesan,
                metodePay: transaksi.metodePay,
                createdAt: transaksi.createdAt,
                updatedAt: transaksi.updatedAt,
                details: []
            };

            // Loop melalui detail transaksi
            for (const detail of detailTransaksis) {
                // Temukan barang yang sesuai dengan detail transaksi
                const barang = await barangModel.findByPk(detail.id_barang);
                if (barang) {
                    // Tambahkan detail transaksi ke dalam objek transaksi
                    transaksiInfo.details.push({
                        id_detail_transaksi: detail.id_detail_transaksi,
                        id_barang: detail.id_barang,
                        barang: {
                            id_barang: barang.id_barang,
                            nama: barang.nama,
                            harga: barang.harga,
                            qyt: detail.qyt,
                        },
                        total: detail.total
                    });
                }
            }

            // Temukan informasi pengguna yang sesuai dengan id_user
            const user = await userModel.findByPk(transaksi.id_user);
            if (user) {
                transaksiInfo.user = {
                    id_user: user.id_user,
                    nama: user.nama,
                    email: user.email
                };
            }

            // Tambahkan informasi transaksi ke dalam array data transaksi
            transaksiData.push(transaksiInfo);
        }

        // Kirim respons dengan data transaksi
        res.status(200).json({ message: 'Transaksi berhasil diambil', data: transaksiData });
    } catch (error) {
        res.status(500).json({ message: 'Kesalahan dalam mengambil transaksi', error: error.message });
    }
};

module.exports = {
    addTransaksi,
    getTransaksi
};
