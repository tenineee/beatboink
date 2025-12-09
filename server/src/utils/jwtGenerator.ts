import jwt from 'jsonwebtoken';

export const jwtGenerator = (userId: number): string => {
    const payload = {
        user: {
            id: userId
        }
    };

    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: '1d'
    });
};