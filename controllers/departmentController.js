const db = require('../models/db');

exports.getAllDepartments = (req, res) => {
  const sql = `
    SELECT id, name, description, photo
    FROM academic_department
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Помилка при отриманні кафедр:', err);
      return res.status(500).json({ error: 'Не вдалося отримати кафедри' });
    }

    res.json(results);
  });
};

exports.getDepartmentById = (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT id, name, description, photo
    FROM academic_department
    WHERE id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('❌ Помилка при отриманні кафедри:', err);
      return res.status(500).json({ error: 'Не вдалося отримати кафедру' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Кафедра не знайдена' });
    }

    res.json(results[0]);
  });
};