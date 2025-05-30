import jwt from 'jsonwebtoken'

export const generateToken = (userId , res) => {
    const token = jwt.sign(
        {id:  userId},
        process.env.JWT_SECRET,
        {expiresIn: '4d'}
    )

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 4*24*60*60*1000,
        //sameSite: 'Lax' moi truong dev
        sameSite: 'None',
    })

    return token
}
