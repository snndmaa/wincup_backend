const express = require('express')
const bcrypt = require('bcryptjs')

const { User } = require('../models/user')
const { verifyAdmin } = require('../middleware')


const router = express.Router()

router.get(`/`, async (req, res, next) => {
    try {
        const users = await User.find().select('-password -verificationToken')

        if(!users) throw 'NotFound'

        res.send({
            status: 'success',
            users
        })

    } catch (error) {
        next(error)
    }
})

router.get(`/:id`, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        .select('-passwordHash -verificationToken')

        if(!user) throw 'NotFound'

        res.send({
            status: 'success',
            user
        })

    } catch (error) {
        next(error)
    }
})

router.post('/', verifyAdmin, async (req, res, next) => {
    const { userName, email, gender, password, isVerified, isAdmin } = req.body

    try {
        let user = new User({
            userName,
            email,
            gender,
            password: bcrypt.hashSync(password, 10),
            isVerified,
            isAdmin,
        })

        user = await user.save()

        return res.send({
            status: 'success',
            user
        })

    } catch (error) {
        if (error.name === 'MongoServerError') {
            next('DuplicateError')
        }

        next(error)    
    }
})

router.put('/:id', verifyAdmin, async (req, res, next) => {
    const { userName, email, gender, password, isVerified, isAdmin } = req.body

    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id },
            {
                userName,
                email,
                gender,
                password: bcrypt.hashSync(password, 10),
                isVerified,
                isAdmin,
            },
            {new: true}
        )

        if (!user) throw 'NotFound'

        res.send({
            status: 'success',
            user
        })
    } catch (error) {
       next(error) 
    }
})

router.delete('/:id', verifyAdmin, async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

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