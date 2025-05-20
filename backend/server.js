require('dotenv').config(); // Завантажуємо змінні середовища на самому початку

const express = require('express');
const cors = require('cors');
const app = express();

// --- Підключення маршрутів (Routes) ---
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const filterRoutes = require('./routes/filters');
const userActionsRoutes = require('./routes/userActions');

// --- Конфігурація мідлварів (Middleware) ---
// Вмикаємо CORS для дозволу запитів з різних доменів
app.use(cors());

// Парсинг JSON-тіла запитів
app.use(express.json());

// --- Загальний мідлвар для логування запитів (опціонально) ---
// Цей мідлвар буде виконуватися для кожного запиту
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url} - ${new Date().toISOString()}`);
    next();
});

// --- Підключення маршрутів до додатка ---
// Всі маршрути, пов'язані з автентифікацією
app.use('/api', authRoutes); // '/api/login', '/api/register', '/api/account'

// Маршрути для продуктів
app.use('/api/products', productRoutes);

// Маршрути для фільтрів
app.use('/api/filters', filterRoutes);

// Маршрути для дій користувача
app.use('/api/user', userActionsRoutes);


// --- Загальний обробник помилок (Error Handling Middleware) ---
// Це має бути останній мідлвар. Він ловить помилки, які не були оброблені іншими мідлварами або роутами.
app.use((err, req, res, next) => {
    console.error('--- ГЛОБАЛЬНА НЕВІДЛОВЛЕНА ПОМИЛКА СЕРВЕРА ---');
    console.error('Повідомлення:', err.message);
    console.error('Стек викликів:', err.stack);
    console.error('Запит:', req.method, req.originalUrl);
    console.error('----------------------------------------------------');

    // Відправлення загальної відповіді клієнту
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: 'Сталася непередбачена помилка сервера. ' + err.message,
        // У продакшені уникайте надсилання стеку помилок клієнту
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
});

// --- Запуск сервера ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
    console.log(`Для доступу до API використовуйте http://localhost:${PORT}/api/`);
});