const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')

const {User} = require('../models/user')


router.get(`/`, async(req, res, next) => {
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
        const user = await User.findById(req.params.id).select('-passwordHash -verificationToken')

        if(!user) throw 'NotFound'

        res.send({
            status: 'success',
            user
        })

    } catch (error) {
        next(error)
    }
})

router.post('/', async (req, res, next) => {
    const { userName, email, gender, password, isVerified } = req.body

    try {
        let user = User({
            userName,
            email,
            gender,
            password: bcrypt.hashSync(password, 10),
            isVerified,
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

router.put('/:id', async (req, res, next) => {
    const { userName, email, gender, } = req.body

    try {
        const user = await User.findOneAndUpdate(
            {_id: req.params.id},
            {
                userName,
                email,
                gender,
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

router.delete('/:id', async (req, res, next) => {
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