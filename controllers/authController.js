const router = require('express').Router()
const User = require('../Model/User')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

router.post('/register', async (req, res) => {
    const { email, password } = req.body
    console.log("Email", email);
    console.log("Password", password);

    if (!req.body || !req.body.email || !req.body.password) {
        return res.status(400).send("Invalid request body")
    }

    const foundUser = await User.findOne({ email: email })

    if (foundUser) return res.status(400).end("Email exists")
    const user = new User({
        email: email,
        password: password
    })

    try {
        const savedUser = await user.save()
        res.status(200).end(savedUser)
    } catch (error) {
        res.status(400).send(error)
    }
})


router.post('/login', async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email: email })

    if (!user) return res.status(400).send("Email is not found")

    const savedPass = user.password
    if (savedPass === password) {
        console.log("Welcome");
        return res.status(200).send("Welcome")
    } else {
        return res.status(400).send("Password do not match")
    }

})

// create a link to be sent to user for password-reset
// link should have user-id and token
// create a password-reset route....DONE
// create forms for: sign-in,sign-up,forgot-pass
// forgot pass should have an email input field and a search button..when the button is clicked, the forgot-pass     route should be called and a reset link displayed on the page.
// Once the reset-link is clicked, it should open in a new tab. A new form for new password should be renderd.


router.post('/forgot-password', async (req, res) => {
    const { email } = req.body
    try {
        const user = await User.findOne({ email })

        if (!user) return res.status(400).send("User not found")

        const secret = process.env.TOKEN_SECRET + user.password
        const token = jwt.sign({ email: user.email, id: user._id }, secret)
        const link = `https://password-reset-bu5f.onrender.com/reset-password/${user._id}/${token}`
        // const link = `http://localhost:3000/reset-password/${user._id}/${token}`

        const config = {
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            }
        }
        const transporter = nodemailer.createTransport(config)
        const mail_options = {
            from: process.env.EMAIL,
            to: user.email,
            subject: "Reset Password",
            text: "Reset Password",
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document</title>
                </head>
                <body>
                    <p>A password reset event has been triggered. The password reset window is limited to 10 minutes.If you do not reset your password within the 10 minutes, you will need to submit a new request.
                    To complete the password reset process, visit the following link: </p> <br/>
                    ${link}
                    <br/>
                    <p>Username: ${user.email}</p>
                </body>
                </html>`
        }
        transporter.sendMail(mail_options, (error, info) => {
            if (error) {
                res.send(error);
            } else {
                return res.status(200).json({
                    msg: "You should receive an email",
                    token: link,
                    info: info.messageId,
                    preview: nodemailer.getTestMessageUrl(info)
                })
            }
        })
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/reset-password/:id/:token', async (req, res) => {
    const { id, token } = req.params

    const user = await User.findOne({ _id: id })
    if (!user) {
        return res.status(404).json({ status: "User not found!" })
    }
    const secret = process.env.TOKEN_SECRET + user.password
    try {
        const verify = jwt.verify(token, secret)
        return res.status(200).send("Verified.")
    } catch (error) {
        return res.send(error)
    }
})

router.post('/reset-password/:id/:token', async (req, res) => {
    const { id, token } = req.params
    const { newPassword, passwordConfirm } = req.body

    const user = await User.findOne({ _id: id })
    if (!user) {
        return res.status(404).json({ status: "User not found!" })
    }
    const secret = process.env.TOKEN_SECRET + user.password
    try {
        const verify = jwt.verify(token, secret)

        if (!newPassword) return res.status(400).json({ msg: "New Password cannot be empty" })

        if (newPassword !== passwordConfirm) {
            return res.status(400).json({ msg: "Password must be same" })
        }
        user.password = newPassword
        user.save()
        return res.status(200).send("PasswordChanged.")
    } catch (error) {
        return res.send(error)
    }
})

module.exports = router

