import {Request, Response, NextFunction} from 'express';
import {isValidEmail, isValidPassword} from "../utils/validators";

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        res.status(400).json({error: "Заполните все поля"});
        return;
    }

    if (!isValidEmail(email)) {
        res.status(400).json({error: 'Некорректный email'});
        return;
    }

    if (!isValidPassword(password)) {
        res.status(400).json({error:'Пароль должен содержать минимум 8 символов, буквы и цифры'});
        return;
    }
    next();
}

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({error:'Заполните все поля'});
        return;
    }

    if (!isValidEmail(email)) {
        res.status(400).json({error:'Некорректный email'});
        return;
    }
    next();
}