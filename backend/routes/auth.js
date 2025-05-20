const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../models/db');

const router = express.Router();

const secretKey = process.env.JWT_SECRET || 'super-secret-dev-key-please-change-in-prod';
if (process.env.NODE_ENV !== 'production' && !process.env.JWT_SECRET) {
    console.warn('ВНИМАНИЕ: JWT_SECRET не встановлений як змінна середовища. Використовується fallback-ключ. Це небезпечно для продакшену!');
}

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        console.warn('Спроба входу з відсутніми обліковими даними. Отримано:', req.body);
        return res.status(400).json({ message: 'Будь ласка, введіть email та пароль.' });
    }

    try {
        console.log(`[LOGIN] Спроба входу для користувача: ${email}`);

        const [users] = await pool.execute(
            'SELECT id, first_name, last_name, email, password, phone, birthday FROM user WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            console.log(`[LOGIN] Вхід не вдався для ${email}: Користувача не знайдено в БД.`);
            return res.status(400).json({ message: 'Користувача не знайдено.' });
        }

        const user = users[0];
        console.log(`[LOGIN] Користувача ${email} знайдено. Порівняння паролів...`);

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log(`[LOGIN] Вхід не вдався для ${email}: Невірний пароль.`);
            return res.status(400).json({ message: 'Невірний пароль.' });
        }

        console.log(`[LOGIN] Користувач ${email} успішно аутентифікований. Генерація токена...`);

        const token = jwt.sign(
            {
                userId: user.id,
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone: user.phone,
                    birthday: user.birthday,
                }
            },
            secretKey,
            { expiresIn: '1h' }
        );

        console.log(`[LOGIN] Вхід успішний для ${email}. Токен видано.`);
        res.json({ message: 'Вхід успішний', token });

    } catch (err) {
        console.error('----------------------------------------------------');
        console.error(`[LOGIN ERROR] Помилка в обробнику POST /api/login для ${email}:`);
        console.error('Повідомлення:', err.message);
        console.error('Стек викликів:', err.stack);
        console.error('Об\'єкт помилки:', err);
        console.error('----------------------------------------------------');

        res.status(500).json({ message: 'Помилка сервера при вході.' });
    }
});

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                console.warn('[AUTH] Помилка верифікації токена:', err.message);
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: 'Термін дії токена закінчився. Будь ласка, увійдіть знову.' });
                }
                return res.status(403).json({ message: 'Недійсний токен.' });
            }
            req.user = decoded;
            console.log(`[AUTH] Токен успішно верифіковано для userId: ${decoded.userId}`);
            next();
        });
    } else {
        console.warn('[AUTH] Спроба доступу без токена авторизації.');
        return res.status(401).json({ message: 'Потрібен токен для авторизації.' });
    }
}

router.get('/account', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        console.log(`[ACCOUNT] Отримання даних акаунта для userId: ${userId}`);

        const [users] = await pool.execute(
            'SELECT id, first_name, last_name, email, phone, birthday FROM user WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            console.warn(`[ACCOUNT] Дані користувача з userId ${userId} не знайдено в БД.`);
            return res.status(404).json({ message: 'Дані користувача не знайдено в базі даних.' });
        }

        const fullUserData = users[0];
        console.log(`[ACCOUNT] Дані акаунта для userId ${userId} успішно завантажені.`);
        res.json({ message: 'Дані акаунта успішно завантажені', user: fullUserData });

    } catch (err) {
        console.error('----------------------------------------------------');
        console.error('[ACCOUNT ERROR] Внутрішня помилка сервера при отриманні даних акаунта:');
        console.error('Повідомлення:', err.message);
        console.error('Стек викликів:', err.stack);
        console.error('----------------------------------------------------');
        return res.status(500).json({ message: 'Внутрішня помилка сервера при отриманні даних акаунта.' });
    }
});

router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password, phone, birthday } = req.body;

    const normalizedEmail = email ? email.trim().toLowerCase() : null;

    if (!normalizedEmail || !password || !first_name || !last_name) {
        console.warn('Спроба реєстрації з відсутніми обов\'язковими полями. Отримано:', req.body);
        return res.status(400).json({ message: 'Будь ласка, заповніть усі обов’язкові поля: ім\'я, прізвище, email, пароль.' });
    }

    try {
        console.log(`[REGISTER] Спроба реєстрації нового користувача з email: ${normalizedEmail}`);

        const [existing] = await pool.execute('SELECT id FROM user WHERE email = ?', [normalizedEmail]);
        if (existing.length > 0) {
            console.log(`[REGISTER] Реєстрація не вдався для ${normalizedEmail}: Користувач вже існує.`);
            return res.status(409).json({ message: 'Користувач з таким email вже існує.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(`[REGISTER] Пароль для ${normalizedEmail} успішно хешовано.`);

        const [result] = await pool.execute(
            `INSERT INTO user (first_name, last_name, email, password, phone, birthday)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                first_name,
                last_name,
                normalizedEmail,
                hashedPassword,
                phone || null,
                birthday || null,
            ]
        );
        const newUserId = result.insertId;
        console.log(`[REGISTER] Новий користувач ${normalizedEmail} (ID: ${newUserId}) успішно доданий до БД.`);

        const token = jwt.sign(
            {
                userId: newUserId,
                user: {
                    id: newUserId,
                    first_name: first_name,
                    last_name: last_name,
                    email: normalizedEmail,
                    phone: phone || null,
                    birthday: birthday || null,
                }
            },
            secretKey,
            { expiresIn: '1h' }
        );

        console.log(`[REGISTER] Реєстрація успішна для ${normalizedEmail}. Токен видано.`);
        return res.status(201).json({ message: 'Реєстрація успішна', token });

    } catch (err) {
        console.error('----------------------------------------------------');
        console.error(`[REGISTER ERROR] Внутрішня помилка сервера при реєстрації для ${normalizedEmail}:`);
        console.error('Повідомлення:', err.message);
        console.error('Стек викликів:', err.stack);
        console.error('Об\'єкт помилки:', err);
        console.error('----------------------------------------------------');

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Користувач з таким email вже існує.' });
        }
        res.status(500).json({ message: 'Внутрішня помилка сервера при реєстрації.' });
    }
});

module.exports = router;