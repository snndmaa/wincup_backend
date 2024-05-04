const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    picture: {
        type: Buffer,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
})

profileSchema.virtual('id').get(function (){
    return this._id.toHexString()
})

profileSchema.set('toJSON', {
    virtuals: true
})

exports.Profile = mongoose.model('Profile', profileSchema)