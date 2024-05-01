const express    = require('express')
const router     = express.Router()
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { v4: uuidv4 } = require('uuid')
const crypto = require('crypto');

const {User} = require('../models/user')


const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'adaline.weimann80@ethereal.email',
        pass: 'CsnzBNmutNRH6wFRgE'
    }
})

router.post(`/register`, async (req, res, next) => {
    try {
        const { userName, email, gender,  password } = req.body
        if (!(userName, email, gender && password )) throw {name: 'MissingFields'}
        
        // if (await User.find({email})) {
        //     throw 'DuplicateError'
        // }

        let user = new User({
            userName,
            email,
            gender,
            password: bcrypt.hashSync(req.body.password, 10),
        })        
        user = await user.save()
        
        return res.send({
            user,
            status: 'success'
        })
    }
    catch (error) {

        // if (error.name === 'MongoServerError') {
        //     throw 'DuplicateError'
        // }
        next(error)
    }
})

router.post('/send-mail', async (req, res, next) => {
    const email = req.body.email

    const verificationToken = uuidv4()

    const user = await User.findOneAndUpdate({email}, {verificationToken})

    
    const mailOptions = {
        from: 'adaline.weimann80@ethereal.email',
        to: email,
        subject: 'Email Verification',
        text: `Click the following link to verify your email: ${process.env.SERVER_BASE_URL}/auth/verify?token=${verificationToken}`,
    };
    
    
    try{
        if (!user) throw 'ValidationError'
        
        await transporter.sendMail(mailOptions)
        res.send({
            status: 'success'
        })
    }
    catch (error) {
        next(error)
    }
})

router.get('/verify', async (req, res, next) => {
    const { token } = req.query; // Retrieve the verification token from the query parameters
  
    const user  = await User.findOne({verificationToken: token})

    try {
        if (token === user.verificationToken) {
            await User.findOneAndUpdate({verificationToken: token}, {isVerified: true})
            
            res.send({ status: 'success' })
        }
    } catch (error) {
        next(error)
    }
  });

router.post(`/login`, async (req, res, next) => {
    const secret  = process.env.SECRET

    try {
        const { userName, password } = req.body

        if (userName) {
            const user    = await User.findOne({ userName })

            
            if (!user) {    
                throw 'NotFound'
            } else if(bcrypt.compareSync(password, user.password)){
                // if (!user.isVerified) throw 'ValidationError'
                const token = jwt.sign(
                    {
                        userId: user.id,
                        isAdmin: user.isAdmin
                    },
                    secret
                )

                // res.cookie('jwt', token, { httpOnly: true, secure: true });
                res.send({
                    status: 'success',
                    token,
                    id: user.id,
                });            
            }
            else{
                throw 'ValidationError'
        }}
        else {
            throw 'MissingFields'
        }
    }
    catch (error) {
        next(error)
    }
})

router.post('/forgot-password', async (req, res, next) => {
    try {
        const userName = req.body.userName
        const user = await User.findOne({ userName })

        if (!user) throw 'NotFound'

        const resetToken = crypto.randomBytes(20).toString('hex')

        user.resetPasswordToken   = resetToken
        user.resetPasswordExpires = Date.now() + 3600000
        await user.save()

        const mailOptions = {
            from: 'adaline.weimann80@ethereal.email',
            to: user.email,
            subject: 'Reset your password',
            text: `Click the link to reset your password: ${process.env.SERVER_BASE_URL}/auth/reset-password/${resetToken}`,
        };

        await transporter.sendMail(mailOptions)
        res.send({
            status: 'success'
        })

    } catch (error) {
        next(error)
    }
})

router.post('/reset-password/:token', async (req, res, next) => {
    try {
        const token = req.params.token
        const { password } = req.body

        const user = await User.findOneAndUpdate({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        }, {
            password: bcrypt.hashSync(password, 10),
        }, { new: true })

        if (!user) throw 'NotFound'

        res.send({
            status: 'success',
            user
        })

    } catch (error) {
        next(error)
    }
})


module.exports = router