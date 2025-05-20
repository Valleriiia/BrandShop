const express = require('express');
const router = express.Router();
const userActions = require('../controllers/userActionsController');
const bcrypt = require('bcryptjs');
const pool = require('../models/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-dev-key-please-change-in-prod';

const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Необхідна автентифікація. Токен відсутній.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Необхідна автентифікація. Невірний формат токена.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Помилка верифікації токена:', error);
        return res.status(403).json({ message: 'Недійсна автентифікація. Токен недійсний або прострочений.' });
    }
};

// Улюблені
router.post('/favorites', userActions.addToFavorites);
router.delete('/favorites', userActions.removeFromFavorites);
router.get('/favorites/:userId', userActions.getFavorites);

// Кошик
router.post('/cart', userActions.addToCart);
router.delete('/cart', userActions.removeFromCart);
router.get('/cart/:userId', userActions.getCart);

// Зміна паролю
router.post('/change-password', isAuthenticated, async (req, res) => {
    const { old_pass, new_pass, confirm_pass } = req.body;
    const userId = req.userId;

    if (!old_pass || !new_pass || !confirm_pass) {
        return res.status(400).json({ message: 'Будь ласка, заповніть всі поля пароля.' });
    }
    if (new_pass !== confirm_pass) {
        return res.status(400).json({ message: 'Новий пароль та підтвердження не співпадають.' });
    }
    if (new_pass.length < 6) {
        return res.status(400).json({ message: 'Новий пароль має бути щонайменше 6 символів.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.execute(
            'SELECT password FROM user WHERE id = ?', 
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Користувача не знайдено.' });
        }

        const hashedPassword = rows[0].password;

        const isPasswordValid = await bcrypt.compare(old_pass, hashedPassword);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Неправильний старий пароль.' });
        }

        const newHashedPassword = await bcrypt.hash(new_pass, 10);

        await connection.execute(
            'UPDATE user SET password = ? WHERE id = ?', 
            [newHashedPassword, userId]
        );

        res.status(200).json({ message: 'Пароль успішно змінено!' });

    } catch (error) {
        console.error('Помилка при зміні пароля:', error);
        res.status(500).json({ message: 'Помилка сервера при зміні пароля.' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
