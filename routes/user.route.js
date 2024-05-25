const express = require ('express');
const app = express.Router();

const userController = require ('../controllers/user.controller')
const auth = require ('../auth/auth')
const refreshTokenController = require ('../controllers/refreshToken')
const middleware = require ('../middleware/checkRole')

// User
app.post('/register', userController.Register)

// User or Admin
app.post('/login', userController.Login)
app.delete('/logout', userController.Logout)
app.get('/token', refreshTokenController.refreshToken)
app.put('/updateUser/:id', userController.updateUser)
app.put('/resetPasswordUser/:id', userController.resetPasswordUser)

// Admin
app.get('/getUser', middleware.checkRole(['admin']), auth.authVerify, userController.getUser)
app.get('/search/:keyword', middleware.checkRole(['admin']), auth.authVerify, userController.searchUser)
app.get('/getOnlyUser', middleware.checkRole(['admin']), auth.authVerify, userController.findOnlyUser)
app.get('/getOnlyAdmin', middleware.checkRole(['admin']), auth.authVerify, userController.findOnlyAdmin)
app.put('/updateUserByAdmin/:id', middleware.checkRole(['admin']), auth.authVerify, userController.updateAdmin)
app.delete('/deleteUser/:id', middleware.checkRole(['admin']), auth.authVerify, userController.deleteUser)

module.exports = app;