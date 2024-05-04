const express = require('express')
const multer = require('multer')

const { Profile } = require('../models/profile')
const { verifyAdmin } = require('../middleware')
const { User } = require('../models/user')

const router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({
    dest: 'uploads/',
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },

    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image file.'));
        }
        cb(undefined, true);
    }
})

router.get('/', async (req, res, next) => {
    try {
        const profiles = await Profile.find()
        .populate('user')
        .exec()

        if (!profiles) throw 'NotFound'

        res.send({
            status: 'success',
            profiles
        })
    } catch (error) {
        next(error)
    }
})

router.get(`/:id`, async (req, res, next) => {
    try {
        const profile = await Profile.findOne({ user: req.params.id })
        .populate('user')
        .exec()

        if(!profile) throw 'NotFound'

        res.send({
            status: 'success',
            profile
        })

    } catch (error) {
        next(error)
    }
})

router.post('/:id', upload.single('picture'), async (req, res, next) => {
    try {
        const user = req.params.id
        const profileCheck = await Profile.findOne({ user })

        if (profileCheck) throw 'DuplicateError' 
        if (!req.file) throw 'MissingFields'
    
        const { buffer } = req.file

        let profile = new Profile({
            user,
            picture: buffer
        })
    
        profile = await profile.save()
    
        return res.send({
            status: 'success',
            profile
        })
    } catch (error) {
        next(error)    
    }
})

router.put('/:id', upload.single('picture'), async (req, res, next) => {
    try {
        if (!req.file) throw 'MissingFields'
    
        const { buffer } = req.file

        const profile = await Profile.findOneAndUpdate(
            { user: req.params.id },
            {
                picture: buffer
            },
            { new: true }
        )

        if(!profile) throw 'NotFound'
        
        res.send({
            status: 'success',
            profile
        })
    } catch (error) {
        next(error)
    }

})

router.delete*('/:id', verifyAdmin, async (req, res, next) => {
    try {
        const profile = await Profile.findByIdAndDelete(req.params.id)

        if (!profile) throw 'NotFound'

        res.send({
            status: 'success',
            profile
        })

    } catch (error) {
        next(error)
    }
})

module.exports = router