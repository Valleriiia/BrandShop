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
  const { user_id, product_id, attribute_id, quantity } = req.body;

  if (!user_id || !product_id || !attribute_id) {
    return res.status(400).json({ error: 'Необхідні поля відсутні' });
  }

  const sql = `
    INSERT INTO shopping_cart (user_id, product_id, attribute_id, quantity)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + ?
  `;

  db.query(sql, [user_id, product_id, attribute_id, quantity || 1, quantity || 1], (err) => {
    if (err) {
      console.error("❌ Помилка при додаванні до кошика:", err);
      return res.status(500).json({ error: 'Не вдалося додати товар до кошика' });
    }

    res.json({ message: 'Товар додано до кошика' });
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
    SELECT 
      c.id AS cart_id,
      p.*,
      c.quantity,
      col.color,
      sz.size,
      comp.composition,
      country.country
    FROM shopping_cart c
    JOIN product p ON c.product_id = p.id
    JOIN attributes_product ap ON c.attribute_id = ap.id
    LEFT JOIN color col ON ap.color_id = col.id
    LEFT JOIN size sz ON ap.size_id = sz.id
    LEFT JOIN composition comp ON ap.composition_id = comp.id
    LEFT JOIN country_of_manufacture country ON ap.country_id = country.id
    WHERE c.user_id = ?
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("❌ Помилка при отриманні кошика:", err);
      return res.status(500).json({ error: 'Не вдалося отримати кошик' });
    }

    res.json(results);
  });
};


exports.updateCartItem = (req, res) => {
  const { user_id, product_id, attribute_id, quantity } = req.body;

  if (!user_id || !product_id || !attribute_id || !quantity) {
    return res.status(400).json({ error: 'Усі поля обов’язкові' });
  }

  const sql = `
    UPDATE cart
    SET quantity = ?
    WHERE user_id = ? AND product_id = ? AND attribute_id = ?
  `;

  db.query(sql, [quantity, user_id, product_id, attribute_id], (err, result) => {
    if (err) {
      console.error("❌ Помилка при оновленні кількості:", err);
      return res.status(500).json({ error: 'Не вдалося оновити кількість' });
    }

    res.json({ message: 'Кількість оновлено' });
  });
};
