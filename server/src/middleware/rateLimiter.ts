import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 min
    max: 5,
    message: {error:'Слишком много попыток, попробуйте позже'},
    standardHeaders: true,
    legacyHeaders: false,
});