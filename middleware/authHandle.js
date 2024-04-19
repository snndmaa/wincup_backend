const { expressjwt } = require('express-jwt')

const authHandle = () => {
    const secret  = process.env.SECRET
    const URLBase = process.env.URL_BASE

    return expressjwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            '/',
            `${URLBase}/auth/login`,
            `${URLBase}/auth/register`,
            `${URLBase}/auth/send-mail`,
            new RegExp(`${URLBase}/auth/verify?[a-zA-Z0-9]+`),
            new RegExp(`${URLBase}/driver/auth/verify`),
            new RegExp(`${URLBase}/users/[a-zA-Z0-9]+/phone`),
        ]
    })
}

const isRevoked = (req, token) => {

    if (token.payload.isAdmin) return true
    return false 
}

module.exports = authHandle