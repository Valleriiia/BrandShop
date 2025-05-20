const db = require('../models/db');

// ==== FAVORITES ====

exports.addToFavorites = (req, res) => {
  const { user_id, product_id } = req.body;
  const sql = `INSERT IGNORE INTO favourites (user_id, product_id) VALUES (?, ?)`;
  db.query(sql, [user_id, product_id], (err) => {
    if (err) return res.status(500).json({ error: 'Помилка при додаванні в улюблені' });
    res.json({ message: 'Додано в улюблені' });
  });
};

exports.removeFromFavorites = (req, res) => {
  const { user_id, product_id } = req.body;
  const sql = `DELETE FROM favourites WHERE user_id = ? AND product_id = ?`;
  db.query(sql, [user_id, product_id], (err) => {
    if (err) return res.status(500).json({ error: 'Помилка при видаленні з улюблених' });
    res.json({ message: 'Видалено з улюблених' });
  });
};

exports.getFavorites = (req, res) => {
  const user_id = req.params.userId;
  const sql = `
    SELECT p.*
    FROM product p
    JOIN favourites f ON f.product_id = p.id
    WHERE f.user_id = ?
  `;
  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Помилка при отриманні улюблених' });
    res.json(results);
  });
};

// ==== CART ====

exports.addToCart = (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  const sql = `
    INSERT INTO shopping_cart (user_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + ?
  `;
  db.query(sql, [user_id, product_id, quantity || 1, quantity || 1], (err) => {
    if (err) return res.status(500).json({ error: 'Помилка при додаванні до кошика' });
    res.json({ message: 'Додано до кошика' });
  });
};

exports.removeFromCart = (req, res) => {
  const { user_id, product_id } = req.body;
  const sql = `DELETE FROM shopping_cart WHERE user_id = ? AND product_id = ?`;
  db.query(sql, [user_id, product_id], (err) => {
    if (err) return res.status(500).json({ error: 'Помилка при видаленні з кошика' });
    res.json({ message: 'Видалено з кошика' });
  });
};

exports.getCart = (req, res) => {
  const user_id = req.params.userId;
  const sql = `
    SELECT p.*, c.quantity
    FROM product p
    JOIN shopping_cart c ON c.product_id = p.id
    WHERE c.user_id = ?
  `;
  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Помилка при отриманні кошика' });
    res.json(results);
  });
};
