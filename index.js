const express = require ('express');
const cors = require ('cors')
const dotenv = require ('dotenv')
const cookieParser = require ('cookie-parser');

dotenv.config();
const app = express();
app.use(cookieParser());
app.use(cors())
app.use(express.json())

const userRoute = require ('./routes/user.route')
const barangRoute = require ('./routes/barang.route')

app.use('/user', userRoute)
app.use('/barang', barangRoute)

app.listen(8000, () => {
    console.log('Server is running on port 8000');
})