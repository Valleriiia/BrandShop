const db = require('../models/db');

exports.getAllFilters = async (req, res) => {
    try {
        const queries = {
            colors: 'SELECT id, color AS name FROM color',
            sizes: 'SELECT id, size AS name FROM size',
            compositions: 'SELECT id, composition AS name FROM composition',
            countries: 'SELECT id, country AS name FROM country_of_manufacture',
            categories: 'SELECT id, name FROM categories'
        };

        const promises = Object.entries(queries).map(async ([key, sql]) => {
            const [rows] = await db.query(sql);
            return [key, rows];
        });

        const resultsArray = await Promise.all(promises);
        const result = Object.fromEntries(resultsArray);

        res.json(result);

    } catch (error) {
        console.error('Помилка при отриманні фільтрів:', error);
        res.status(500).json({ error: 'Не вдалося отримати фільтри' });
    }
};