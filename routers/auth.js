const express    = require('express')
const router     = express.Router()
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { v4: uuidv4 } = require('uuid')

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
        const { firstName, lastName, email, age, phoneNumber, password } = req.body
        if (!(firstName, lastName, email, age && password && phoneNumber)) throw {name: 'MissingFields'}
        
        // if (await User.find({email})) {
        //     throw 'DuplicateError'
        // }

        let user = new User({
            firstName,
            lastName,
            age,
            email,
            phoneNumber,
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
        if (!user) throw'ValidationError'
        
        await transporter.sendMail(mailOptions)
        res.send('Verification email sent successfully!')
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
        const { email, password } = req.body

        if (email) {
            const user    = await User.findOne({email: email})

            
            if (!user) {    
                throw 'NotFound'
            } else if(bcrypt.compareSync(password, user.password)){
                if (!user.isVerified) throw 'ValidationError'
                const token = jwt.sign(
                    {
                        userID: user.id,
                        isAdmin: user.isAdmin
                    },
                    secret
                )

                // res.cookie('jwt', token, { httpOnly: true, secure: true });
                res.send({
                    status: 'success',
                    token
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


module.exports = router