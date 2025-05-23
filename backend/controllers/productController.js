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

  const productQuery = `
    SELECT 
      p.*,
      c.name AS category_name,
      d.name AS department_name,
      comp.composition,
      country.country
    FROM product p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN academic_department d ON p.department_id = d.id
    LEFT JOIN attributes_product ap ON ap.product_id = p.id
    LEFT JOIN composition comp ON ap.composition_id = comp.id
    LEFT JOIN country_of_manufacture country ON ap.country_id = country.id
    WHERE p.id = ? AND p.is_active = 1
    LIMIT 1
  `;

  db.query(productQuery, [productId], (err, productResults) => {
    if (err) {
      console.error("❌ Помилка при запиті товару:", err);
      return res.status(500).json({ error: 'Помилка при отриманні товару' });
    }

    if (productResults.length === 0) {
      return res.status(404).json({ error: 'Товар не знайдено' });
    }

    const product = productResults[0];

    // Витяг атрибутів (всі унікальні комбінації розмір+колір)
    const attrQuery = `
      SELECT
        col.id AS color_id,
        col.color,
        sz.id AS size_id,
        sz.size
      FROM attributes_product ap
      LEFT JOIN color col ON ap.color_id = col.id
      LEFT JOIN size sz ON ap.size_id = sz.id
      WHERE ap.product_id = ?
    `;

    db.query(attrQuery, [productId], (err, attrResults) => {
      if (err) {
        console.error("❌ Помилка при отриманні атрибутів:", err);
        return res.status(500).json({ error: 'Помилка при отриманні атрибутів товару' });
      }

      // Схожі товари
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
          console.error("❌ Помилка при запиті схожих товарів:", err);
          return res.status(500).json({ error: 'Помилка при отриманні схожих товарів' });
        }

        res.json({
          product,
          attributes: attrResults,
          similar: similarResults
        });
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

exports.searchProducts = (req, res) => {
  const query = req.query.query;

  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Порожній пошуковий запит' });
  }

  const searchTerm = `%${query}%`;

  const sql = `
    SELECT DISTINCT p.*
    FROM product p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN academic_department d ON p.department_id = d.id
    LEFT JOIN attributes_product ap ON ap.product_id = p.id
    LEFT JOIN color col ON ap.color_id = col.id
    LEFT JOIN composition comp ON ap.composition_id = comp.id
    LEFT JOIN country_of_manufacture country ON ap.country_id = country.id
    WHERE p.is_active = 1 AND (
      p.name LIKE ? OR
      c.name LIKE ? OR
      d.name LIKE ? OR
      col.color LIKE ? OR
      comp.composition LIKE ? OR
      country.country LIKE ?
    )
  `;

  const params = Array(6).fill(searchTerm); // передаємо одне і те саме значення 6 разів

    db.query(sql, params, (err, results) => {
    if (err) {
      console.error('❌ SQL ПОМИЛКА:', err.sqlMessage);
      console.error('🔍 SQL:', sql);
      return res.status(500).json({ error: 'Помилка при пошуку товарів', detail: err.sqlMessage });
    }


    res.json(results);
  });
};


exports.getDiscountedProducts = (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const sql = `
    SELECT *
    FROM product
    WHERE is_active = 1 AND discount > 0
    ORDER BY discount DESC
    LIMIT ?
  `;

  db.query(sql, [limit], (err, results) => {
    if (err) {
      console.error('❌ Помилка при отриманні товарів зі знижкою:', err);
      return res.status(500).json({ error: 'Не вдалося отримати товари зі знижкою' });
    }

    res.json(results);
  });
};

exports.getProductDetails = async (req, res) => {
    const { productId } = req.params; // Отримуємо product_id з параметрів URL

    if (!productId) {
        return res.status(400).json({ status: 'error', message: 'Необхідний productId.' });
    }

    try {
        const sql = `
            SELECT
                p.id,
                p.name,
                p.current_price AS price, -- Беремо current_price як основну ціну
                p.name_of_product_photo AS image_url,
                p.discount,
                p.rating,
                c.name AS category_name,
                ad.name AS department_name
            FROM product p
            JOIN categories c ON p.category_id = c.id
            JOIN academic_department ad ON p.department_id = ad.id
            WHERE p.id = ? AND p.is_active = 1
        `;
        const [rows] = await db.execute(sql, [productId]);

        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Товар не знайдено або не активний.' });
        }

        const product = rows[0];

        return res.status(200).json({ status: 'success', product });
    } catch (error) {
        console.error('❌ Помилка при отриманні деталей продукту:', error);
        return res.status(500).json({ status: 'error', message: 'Помилка сервера при отриманні даних про продукт.' });
    }
};