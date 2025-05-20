const db = require('../models/db');

// POST /api/reviews
exports.addReview = (req, res) => {
  const { user_id, product_id, rating, comment } = req.body;

  if (!user_id || !product_id || !rating) {
    return res.status(400).json({ error: 'Необхідні поля відсутні' });
  }

  const sql = `
    INSERT INTO rating (user_id, product_id, rating, comment)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [user_id, product_id, rating, comment || null], (err) => {
    if (err) {
      console.error('❌ Помилка при додаванні відгуку:', err);
      return res.status(500).json({ error: 'Не вдалося додати відгук' });
    }

    res.json({ message: 'Відгук додано' });
  });
};

// GET /api/reviews/:product_id
exports.getReviewsByProduct = (req, res) => {
  const product_id = req.params.product_id;

  const sql = `
    SELECT r.*, u.name AS user_name
    FROM rating r
    JOIN user u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(sql, [product_id], (err, results) => {
    if (err) {
      console.error('❌ Помилка при отриманні відгуків:', err);
      return res.status(500).json({ error: 'Не вдалося отримати відгуки' });
    }

    res.json(results);
  });
};
