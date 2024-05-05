const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    email: {
        type: 'String',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
})

subscriptionSchema.virtual('id').get(function (){
    return this._id.toHexString()
})

subscriptionSchema.set('toJSON', {
    virtuals: true
})

exports.Subscription = mongoose.model('Subscription', subscriptionSchema)