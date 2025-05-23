const db = require('../models/db');

exports.getAllFilters = (req, res) => {
  const result = {};

  const queries = {
    colors: 'SELECT id, color AS name FROM color',
    sizes: 'SELECT id, size AS name FROM size',
    compositions: 'SELECT id, composition AS name FROM composition',
    countries: 'SELECT id, country AS name FROM country_of_manufacture',
    categories: 'SELECT id, name FROM categories',
    departments: 'SELECT id, name FROM academic_department'
  };

  let completed = 0;
  const total = Object.keys(queries).length;

  for (const key in queries) {
    db.query(queries[key], (err, rows) => {
      if (err) {
        console.error(`Помилка при запиті до ${key}:`, err);
        return res.status(500).json({ error: `Помилка при отриманні ${key}` });
      }

      result[key] = rows;
      completed++;

      if (completed === total) {
        res.json(result);
      }
    });
  }
};
