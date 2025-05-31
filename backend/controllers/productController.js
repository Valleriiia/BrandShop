const db = require('../models/db');

exports.getAllProducts = async (req, res) => {
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
       SELECT DISTINCT p.*
        FROM product p
        JOIN attributes_product ap ON ap.product_id = p.id
        WHERE p.is_active = 1
    `;

    const conditions = [];
    const params = [];

    if (department_id) {
        conditions.push(`p.department_id = ?`);
        params.push(department_id);
    }
    if (category_id) {
        conditions.push(`p.category_id = ?`);
        params.push(category_id);
    }
    if (color_id) {
        conditions.push(`ap.color_id = ?`);
        params.push(color_id);
    }
    if (size_id) {
        conditions.push(`ap.size_id = ?`);
        params.push(size_id);
    }
    if (composition_id) {
        conditions.push(`ap.composition_id = ?`);
        params.push(composition_id);
    }
    if (country_id) {
        conditions.push(`ap.country_id = ?`);
        params.push(country_id);
    }
    if (price_min) {
        conditions.push(`p.current_price >= ?`);
        params.push(parseFloat(price_min));
    }
    if (price_max) {
        conditions.push(`p.current_price <= ?`);
        params.push(parseFloat(price_max));
    }

    if (conditions.length > 0) {
        sql += ' AND ' + conditions.join(' AND ');
    }

    // Сортування
    if (sort === 'cheap') {
        sql += ' ORDER BY p.current_price ASC';
    } else if (sort === 'expencive') {
        sql += ' ORDER BY p.current_price DESC';
    } else if (sort === 'popular') {
        sql += ' ORDER BY p.views DESC';
    } else if (sort === 'new') {
        sql += ' ORDER BY p.date DESC';
    }

    try {
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error('SQL Error:', error);
        res.status(500).json({ error: 'Помилка при отриманні товарів' });
    }
};


exports.getProductById = async (req, res) => {
    const productId = req.params.id;

    try {
        const [productRows] = await db.query(`
            SELECT
                p.*,
                c.name AS category_name,
                d.name AS department_name,
                d.slug AS department_slug,
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
        `, [productId]);

        if (productRows.length === 0) {
            return res.status(404).json({ error: 'Товар не знайдено' });
        }

        const product = productRows[0];

        const [attrRows] = await db.query(`
            SELECT
                col.id AS color_id,
                col.color,
                sz.id AS size_id,
                sz.size,
                ap.id
            FROM attributes_product ap
            LEFT JOIN color col ON ap.color_id = col.id
            LEFT JOIN size sz ON ap.size_id = sz.id
            WHERE ap.product_id = ?
        `, [productId]);

        const [similarRows] = await db.query(`
            SELECT *
            FROM product
            WHERE id != ? AND is_active = 1 AND (
                department_id = ? OR category_id = ?
            )
            ORDER BY RAND()
            LIMIT 10
        `, [productId, product.department_id, product.category_id]);

        res.json({
            product,
            attributes: attrRows,
            similar: similarRows
        });

    } catch (error) {
        console.error("❌ Помилка при запиті товару:", error);
        res.status(500).json({ error: 'Помилка при отриманні товару' });
    }
};


exports.getRandomProducts = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    try {
        const [rows] = await db.query(`
            SELECT *
            FROM product
            WHERE is_active = 1
            ORDER BY RAND()
            LIMIT ?
        `, [limit]);
        res.json(rows);
    } catch (error) {
        console.error("Помилка при вибірці рандомних товарів:", error);
        res.status(500).json({ error: 'Помилка при отриманні рандомних товарів' });
    }
};

exports.searchProducts = async (req, res) => {
    const query = req.query.search;

    if (!query || query.trim() === '') {
        return res.status(400).json({ error: 'Порожній пошуковий запит' });
    }

    const searchTerm = `%${query}%`;
    const params = Array(6).fill(searchTerm);

    try {
        const [rows] = await db.query(`
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
        `, params);
        res.json(rows);
    } catch (error) {
        console.error('❌ SQL ПОМИЛКА:', error.sqlMessage);
        console.error('🔍 SQL:', error.sql);
        return res.status(500).json({ error: 'Помилка при пошуку товарів', detail: error.sqlMessage });
    }
};


exports.getDiscountedProducts = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    try {
        const [rows] = await db.query(`
            SELECT *
            FROM product
            WHERE is_active = 1 AND discount > 0
            ORDER BY discount DESC
            LIMIT ?
        `, [limit]);
        res.json(rows);
    } catch (error) {
        console.error('❌ Помилка при отриманні товарів зі знижкою:', error);
        res.status(500).json({ error: 'Не вдалося отримати товари зі знижкою' });
    }
};
