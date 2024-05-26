const express = require ('express');
const app = express.Router();

const transaksiController = require ('../controllers/transaksi.controller')
const auth = require ('../auth/auth')
const middleware = require ('../middleware/checkRole')

// User
app.post('/add', transaksiController.addTransaksi)
app.get('/get', transaksiController.getTransaksi)

// Admin

module.exports = app;