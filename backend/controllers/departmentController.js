const db = require('../models/db');

exports.getAllDepartments = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT id, name, description, photo, slug
            FROM academic_department
        `);
        res.json(rows);
    } catch (error) {
        console.error('❌ Помилка при отриманні кафедр:', error);
        res.status(500).json({ error: 'Не вдалося отримати кафедри' });
    }
};

exports.getDepartmentById = async (req, res) => {
    const id = req.params.id;

    try {
        const [rows] = await db.query(`
            SELECT id, name, description, photo
            FROM academic_department
            WHERE id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Кафедра не знайдена' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('❌ Помилка при отриманні кафедри:', error);
        res.status(500).json({ error: 'Не вдалося отримати кафедру' });
    }
};

exports.getDepartmentBySlug = async (req, res) => {
    const slug = req.params.slug;

    try {
        const [rows] = await db.query(`
            SELECT id, name, description, mascot_photo
            FROM academic_department
            WHERE slug = ?
        `, [slug]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Кафедра не знайдена' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('❌ Помилка при отриманні кафедри по slug:', error);
        res.status(500).json({ error: 'Помилка при завантаженні кафедри' });
    }
};