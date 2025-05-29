const express = require('express');
const router = express.Router();
const userActions = require('../controllers/userActionsController'); 
const bcrypt = require('bcryptjs');
const pool = require('../models/db');
const jwt = require('jsonwebtoken');
const cardController = require('../controllers/cardController');

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
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Недійсна автентифікація. Термін дії токена закінчився. Будь ласка, увійдіть знову.' });
        }
        return res.status(403).json({ message: 'Недійсна автентифікація. Токен недійсний або прострочений.' });
    }
};

console.log('[DEBUG-ROUTES] userActions.js завантажено.');
console.log('[DEBUG-ROUTES] Перевіряємо наявність getUserOrders:', typeof userActions.getUserOrders);

// ==== Зміна паролю ====
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

// ==== Картка - Отримання даних ====
router.get('/card', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId;
        const card = await cardController.getCardByUserId(userId);

        if (card) {
            const last4 = card.number ? card.number.slice(-4) : null;

            let expiryDateFormatted = null;
            if (card.date) {
                const dateObj = new Date(card.date);
                const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                const year = dateObj.getFullYear();
                expiryDateFormatted = `${month}/${year}`;
            }

            res.status(200).json({
                message: 'Дані картки успішно завантажені.',
                card: {
                    last4: last4,
                    expiry_date: expiryDateFormatted
                }
            });
        } else {
            res.status(200).json({ message: 'Даних картки не знайдено.', card: null });
        }

    } catch (error) {
        console.error('Помилка отримання даних картки:', error);
        res.status(500).json({ message: 'Помилка сервера при отриманні даних картки.' });
    }
});

// ==== Картка - Додавання/Оновлення ====
router.post('/card', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId;
        const { cardNumber, expiryDate, cvv } = req.body;

        if (!cardNumber || !expiryDate || !cvv) {
            return res.status(400).json({ message: 'Будь ласка, надайте номер картки, термін дії та CVV.' });
        }

        const result = await cardController.addOrUpdateCard(userId, cardNumber, expiryDate, cvv);
        res.status(200).json(result);

    } catch (error) {
        console.error('Помилка при додаванні/оновленні картки:', error);
        res.status(500).json({ message: 'Помилка сервера при додаванні/оновленні картки.' });
    }
});

// Улюблені
router.post('/favorites/add', userActions.addToFavorites);
router.delete('/favorites/remove/:productId', isAuthenticated, userActions.removeFromFavorites);
router.get('/favorites', isAuthenticated, userActions.getFavorites);

// ==== Роут для отримання даних облікового запису ====
router.get('/account', isAuthenticated, userActions.getAccountData); // <--- ДОДАЙТЕ ЦЕЙ РЯДОК

// ==== Роути для кошика ====

router.post('/cart/add', isAuthenticated, userActions.addToCart); 
router.get('/cart', isAuthenticated, userActions.getCartItems); 
router.put('/cart/update-quantity', isAuthenticated, userActions.updateCartItemQuantity); 
router.delete('/cart/remove/:productId', isAuthenticated, userActions.removeCartItem); 
router.post('/order', isAuthenticated, userActions.placeOrder);

// ==== Історія замовлень ====
router.get('/orders', isAuthenticated, userActions.getUserOrders);



module.exports = {
    router: router,
    isAuthenticated: isAuthenticated
};