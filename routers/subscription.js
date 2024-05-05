const express = require('express');
const { Subscription } = require('../models/subscription.js');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find().populate('user').exec();

        if (!subscriptions) throw 'NotFound';

        res.send({
            status: 'success',
            subscriptions
        });
    } catch (error) {
        next(error);        
    }
});

router.post('/', async (req, res, next) => {
    const { user, email, date } = req.body;
    try {
        let subscription = new Subscription({
            user,
            email, 
            date
        });

        subscription = await subscription.save();
        
        return res.send({
            status: 'success',
            subscription
        });
    } catch (error) {
        next(error);        
    }
});

module.exports = router;
