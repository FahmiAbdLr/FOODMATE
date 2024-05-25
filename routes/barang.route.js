const express = require ('express');
const app = express.Router();

const barangController = require ('../controllers/barang.controller')
const auth = require ('../auth/auth')
const middleware = require ('../middleware/checkRole')

// User or Admin
app.get('/getBarang', barangController.getAllBarang)
app.get('/search/:keyword', barangController.searchBarang)

// Admin
app.post('/addBarang', auth.authVerify, middleware.checkRole(['admin']), barangController.addBarang)
app.get('/searchById/:keyword', auth.authVerify, middleware.checkRole(['admin']), barangController.searchBarangById)
app.put('/updateBarang/:id', auth.authVerify, middleware.checkRole(['admin']), barangController.updateBarang)
app.delete('/deleteBarang/:id', auth.authVerify, middleware.checkRole(['admin']), barangController.deleteBarang)

module.exports = app;