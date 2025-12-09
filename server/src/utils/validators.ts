export const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPassword = (password: string): boolean => {
    return password.length >= 8 &&
        /[A-Za-z]/.test(password) &&
        /\d/.test(password);
};
