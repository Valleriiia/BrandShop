const db = require('../models/db');

exports.getAllProducts = (req, res) => {
  const {
    department_id,
    category_id,
    color_id,
    size_id,
    composition_id,
    country_id,
    price_min,
    price_max,
    sort
  } = req.query;

  let sql = `
    SELECT p.*
    FROM product p
    LEFT JOIN attributes_product ap ON ap.product_id = p.id
    WHERE p.is_active = 1
  `;

  const conditions = [];

  if (department_id) conditions.push(`p.department_id = ${db.escape(department_id)}`);
  if (category_id) conditions.push(`p.category_id = ${db.escape(category_id)}`);
  if (color_id) conditions.push(`ap.color_id = ${db.escape(color_id)}`);
  if (size_id) conditions.push(`ap.size_id = ${db.escape(size_id)}`);
  if (composition_id) conditions.push(`ap.composition_id = ${db.escape(composition_id)}`);
  if (country_id) conditions.push(`ap.country_id = ${db.escape(country_id)}`);
  if (price_min) conditions.push(`p.current_price >= ${db.escape(price_min)}`);
  if (price_max) conditions.push(`p.current_price <= ${db.escape(price_max)}`);

  if (conditions.length > 0) {
    sql += ' AND ' + conditions.join(' AND ');
  }

  // Сортування
  if (sort === 'price_asc') {
    sql += ' ORDER BY p.current_price ASC';
  } else if (sort === 'price_desc') {
    sql += ' ORDER BY p.current_price DESC';
  } else if (sort === 'popular') {
    sql += ' ORDER BY p.views DESC';
  } else if (sort === 'new') {
    sql += ' ORDER BY p.date DESC';
  }

  db.query(sql, (err, results) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Помилка при отриманні товарів' });
    }
    res.json(results);
  });
};


exports.getProductById = (req, res) => {
  const productId = req.params.id;

  const productQuery = `SELECT * FROM product WHERE id = ? AND is_active = 1`;

  db.query(productQuery, [productId], (err, productResults) => {
    if (err) {
      console.error("Помилка при запиті товару:", err);
      return res.status(500).json({ error: 'Помилка при отриманні товару' });
    }

    if (productResults.length === 0) {
      return res.status(404).json({ error: 'Товар не знайдено' });
    }

    const product = productResults[0];

    // Отримати схожі товари за тією ж кафедрою або категорією
    const similarQuery = `
      SELECT *
      FROM product
      WHERE id != ? AND is_active = 1 AND (
        department_id = ? OR category_id = ?
      )
      ORDER BY RAND()
      LIMIT 5
    `;

    db.query(similarQuery, [productId, product.department_id, product.category_id], (err, similarResults) => {
      if (err) {
        console.error("Помилка при запиті схожих товарів:", err);
        return res.status(500).json({ error: 'Помилка при отриманні схожих товарів' });
      }

      res.json({
        product,
        similar: similarResults
      });
    });
  });
};


exports.getRandomProducts = (req, res) => {
  const limit = parseInt(req.query.limit) || 5; // можна передати ?limit=8
  const sql = `
    SELECT *
    FROM product
    WHERE is_active = 1
    ORDER BY RAND()
    LIMIT ?
  `;

  db.query(sql, [limit], (err, results) => {
    if (err) {
      console.error("Помилка при вибірці рандомних товарів:", err);
      return res.status(500).json({ error: 'Помилка при отриманні рандомних товарів' });
    }

    res.json(results);
  });
};
