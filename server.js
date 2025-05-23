// BACKEND/app.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// --- Імпорт роутерів ---
const authRoutes = require('./routes/auth');
// userActions імпортуємо як router та isAuthenticated
const { router: userSpecificRoutes, isAuthenticated: authMiddleware } = require('./routes/userActions'); 
const filterRoutes = require('./routes/filters');
const reviewRoutes = require('./routes/reviews');
const departmentRoutes = require('./routes/departments');
const productRoutes = require('./routes/products');


// --- Middleware ---
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url} - ${new Date().toISOString()}`);
    next();
});


// ===========================================
// ПІДКЛЮЧЕННЯ РОУТІВ API ЙДЕ ПЕРШИМ!
// ===========================================
app.use('/api', authRoutes); console.log('API Route: /api (auth) registered.');
app.use('/api/products', productRoutes); console.log('API Route: /api/products registered.');
app.use('/api/filters', filterRoutes); console.log('API Route: /api/filters registered.');
app.use('/api/reviews', reviewRoutes); console.log('API Route: /api/reviews registered.');
app.use('/api/departments', departmentRoutes); console.log('API Route: /api/departments registered.');

// Користувацькі дії, які не є кошиком: /api/user/favorites, /api/user/card, /api/user/change-password
app.use('/api/user', userSpecificRoutes); console.log('API Route: /api/user (userActions) registered.');// Використовуємо userSpecificRoutes




// ===========================================
// Після всіх API роутів йдуть СТАТИЧНІ ФАЙЛИ
// та HTML-сторінки.
// ===========================================
const frontendPath = path.join(__dirname, '../FRONTEND');
app.use(express.static(frontendPath)); // ЦЕ МАЄ БУТИ ПІСЛЯ УСІХ API РОУТІВ

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'page', 'index.html'));
});



app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(frontendPath, 'page', 'product.html'));
});

app.get('/page/sign-in.html', (req, res) => {
    res.sendFile(path.join(frontendPath, 'page', 'sign-in.html'));
});


// --- Глобальний обробник помилок ---
app.use((err, req, res, next) => {
    console.error('--- ГЛОБАЛЬНА НЕВІДЛОВЛЕНА ПОМИЛКА СЕРВЕРА ---');
    console.error('Повідомлення:', err.message);
    console.error('Стек викликів:', err.stack);
    console.error('Запит:', req.method, req.originalUrl);
    console.error('----------------------------------------------------');

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: 'Сталася непередбачена помилка сервера. ' + err.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
});

// --- Запуск сервера ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
    console.log(`Для доступу до загальних API (auth, products) використовуйте http://localhost:${PORT}/api/`);
});