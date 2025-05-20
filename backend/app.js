const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const productRoutes = require('./routes/products');

app.use(cors());
app.use(express.json());
app.use('/api/products', productRoutes);

app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});

const filterRoutes = require('./routes/filters');
app.use('/api/filters', filterRoutes);

const userActionsRoutes = require('./routes/userActions');
app.use('/api/user', userActionsRoutes);

const reviewRoutes = require('./routes/reviews');
app.use('/api/reviews', reviewRoutes);

const departmentRoutes = require('./routes/departments');
app.use('/api/departments', departmentRoutes);
