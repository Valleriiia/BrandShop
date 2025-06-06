require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const pool = require('./models/db'); 
const authRoutes = require('./routes/auth');
const { router: userSpecificRoutes, isAuthenticated: authMiddleware } = require('./routes/userActions');
const filterRoutes = require('./routes/filters');
const reviewRoutes = require('./routes/reviews');
const departmentRoutes = require('./routes/departments');
const productRoutes = require('./routes/products');
const photoRoutes = require('./routes/photos');

const app = express();
const PORT = process.env.PORT || 3000;
const frontendPath = path.join(__dirname, '../FRONTEND');

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url} - ${new Date().toISOString()}`);
    next();
});

app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/user', userSpecificRoutes);
app.use('/api/photos', photoRoutes);

app.use(express.static(frontendPath));
app.use('/templates', express.static(path.join(__dirname, 'templates')));

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'page', 'index.html'));
});

app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(frontendPath, 'page', 'product.html'));
});

app.get('/page/sign-in.html', (req, res) => {
    res.sendFile(path.join(frontendPath, 'page', 'sign-in.html'));
});

app.get('/catalog/:slug', (req, res) => {
  res.sendFile(path.join(frontendPath, 'page', 'catalog.html'));
});

app.get('/love', (req, res) => {
  res.sendFile(path.join(frontendPath, 'page', 'love.html'));
});

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

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
    console.log(`Для доступу до загальних API (auth, products) використовуйте http://localhost:${PORT}/api/`);
});