const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')

router.post('/greetings', async (req, res) => {
    // const testAccount = await nodemailer.createTestAccount()
    const config = {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    }

    const transporter = nodemailer.createTransport(config)

    const mail_options = {
        from: process.env.EMAIL,
        to: "ericmuusya909@gmail.com",
        subject: "Message title",
        text: "Heloo there",
        html: `<b>Hello User!</b>`
    }
    transporter.sendMail(mail_options, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            return res.status(200).json({
                msg: "You should receive an email",
                info: info.messageId,
                preview: nodemailer.getTestMessageUrl(info)
            })
        }
    })

    //create transporter
    // const transporter = nodemailer.createTransport({
    //     host: "smtp.ethereal.email",
    //     port: 587,
    //     secure: false, // true for 465, false for other ports
    //     auth: {
    //         user: testAccount.user, // generated ethereal user
    //         pass: testAccount.pass, // generated ethereal password
    //     },
    // })

    //create mail..what you want to send
    // const mail_options = {
    //     from: testAccount.email,
    //     to: "studiomuusya@gmail.com",
    //     subject: "Message title",
    //     text: "Heloo there",
    //     html: `<p>HTML version of the message</p> <br/>
    //             <b>Hello There!!!</b>`
    // }

    // transporter.sendMail(mail_options).then(info => {
    //     return res.status(200).json({
    //         msg: "You should receive an email",
    //         info: info.messageId,
    //         preview: nodemailer.getTestMessageUrl(info)
    //     })
    // })
})

module.exports = router