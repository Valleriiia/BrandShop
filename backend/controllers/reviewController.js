const db = require('../models/db');

// POST /api/reviews
exports.addReview = async (req, res) => {
    const { product_id, rating, comment } = req.body;
    const user_id = req.userId;

    if (!user_id || !product_id || !rating) {
        return res.status(400).json({ error: 'Необхідні поля відсутні' });
    }

    try {
        // Перевірка: чи вже є відгук від цього користувача на цей товар
        const [existing] = await db.query(
            `SELECT * FROM rating WHERE user_id = ? AND product_id = ?`,
            [user_id, product_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Ви вже залишили відгук на цей товар.' });
        }

        // Додавання нового відгуку
        await db.query(`
            INSERT INTO rating (user_id, product_id, rating, comment, date)
            VALUES (?, ?, ?, ?, NOW())
        `, [user_id, product_id, rating, comment || null]);

        // Оновлення середнього рейтингу
        const [avgResult] = await db.query(`
            SELECT ROUND(AVG(rating), 2) AS avg_rating
            FROM rating
            WHERE product_id = ?
        `, [product_id]);

        const avgRating = avgResult[0]?.avg_rating || 0;

        await db.query(`
            UPDATE product SET rating = ? WHERE id = ?
        `, [avgRating, product_id]);

        res.json({ message: 'Відгук додано та рейтинг оновлено', avg_rating: avgRating });

    } catch (error) {
        console.error('❌ Помилка при додаванні відгуку:', error);
        res.status(500).json({ error: 'Не вдалося додати відгук' });
    }
};


// GET /api/reviews/:product_id
exports.getReviewsByProduct = async (req, res) => {
    const product_id = req.params.product_id;

    try {
        const [reviewResults] = await db.query(`
            SELECT
                r.rating,
                r.comment,
                DATE_FORMAT(r.date, '%Y/%m/%d') AS date,
                CONCAT(u.first_name, ' ', u.last_name) AS user_name
            FROM rating r
            JOIN user u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.date DESC
        `, [product_id]);

        // додаємо поле stars
        const reviewsWithStars = reviewResults.map(r => {
            const stars = [];
            for (let i = 1; i <= 5; i++) {
                stars.push(i <= r.rating ? '#fbd300' : '#DFE1E6');
            }
            return {
                user: r.user_name,
                rating: r.rating,
                comment: r.comment,
                date: r.date,
                stars
            };
        });

        // отримаємо середній рейтинг
        const [avgResult] = await db.query(`
            SELECT rating
            FROM product
            WHERE id = ?
        `, [product_id]);

        const average = avgResult[0]?.rating || 0;

        res.json({
            reviews: reviewsWithStars,
            average
        });

    } catch (error) {
        console.error('❌ Помилка при отриманні відгуків:', error);
        res.status(500).json({ error: 'Не вдалося отримати відгуки' });
    }
};