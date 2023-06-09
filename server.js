const express = require('express')
const app = express()
const PORT = process.env.PORT
// const PORT = 5000
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

// app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(cors({ credentials: true, origin: 'https://password-reset-bu5f.onrender.com' }))
app.use(express.json())

const authRoute = require('./controllers/authController')
const emailRoute = require('./controllers/emailController')
dotenv.config()

mongoose.set('strictQuery', false);
mongoose.connect(process.env.DB_CONNECT)


app.use('/api/user', authRoute)
app.use('/api/user', emailRoute)

app.get('/',(req, res) => {
    res.end(`<h1>Welcome to my backend homepage</h1>`)
})

app.listen(PORT, ()=> {
    console.log(`Listening on http://localhost:${PORT}`);
})