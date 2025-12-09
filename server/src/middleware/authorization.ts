import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {AuthRequest} from "../types/express";

interface JwtPayload {
    user: {
        id: number;
    };
}

export const authorization = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(403).json({ error: 'Токен отсутствует' });
        return;
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as JwtPayload;

        req.user = decoded.user;
        next();

    } catch (err) {
        res.status(401).json({ error: 'Токен недействителен' });
    }
};