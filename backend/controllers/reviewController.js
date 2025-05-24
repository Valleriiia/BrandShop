const db = require('../models/db');

// POST /api/reviews
exports.addReview = (req, res) => {
  const { user_id, product_id, rating, comment } = req.body;

  if (!user_id || !product_id || !rating) {
    return res.status(400).json({ error: 'Необхідні поля відсутні' });
  }

  const insertSql = `
    INSERT INTO product_reviews (user_id, product_id, rating, comment)
    VALUES (?, ?, ?, ?)
  `;

  db.query(insertSql, [user_id, product_id, rating, comment || null], (err) => {
    if (err) {
      console.error('❌ Помилка при додаванні відгуку:', err);
      return res.status(500).json({ error: 'Не вдалося додати відгук' });
    }

    // Після вставки — перерахунок середнього рейтингу
    const avgSql = `
      SELECT ROUND(AVG(rating), 0) AS avg_rating
      FROM product_reviews
      WHERE product_id = ?
    `;

    db.query(avgSql, [product_id], (err, result) => {
      if (err) {
        console.error('❌ Помилка при обчисленні середнього рейтингу:', err);
        return res.status(500).json({ error: 'Відгук додано, але не оновлено рейтинг' });
      }

      const avgRating = result[0].avg_rating || 0;

      const updateSql = `
        UPDATE product SET rating = ? WHERE id = ?
      `;

      db.query(updateSql, [avgRating, product_id], (err) => {
        if (err) {
          console.error('❌ Помилка при оновленні рейтингу товару:', err);
          return res.status(500).json({ error: 'Відгук додано, рейтинг не оновлено' });
        }

        res.json({ message: 'Відгук додано та рейтинг оновлено', avg_rating: avgRating });
      });
    });
  });
};


// GET /api/reviews/:product_id
exports.getReviewsByProduct = (req, res) => {
  const product_id = req.params.product_id;

  const sqlReviews = `
    SELECT r.*, u.name AS user_name
    FROM rating r
    JOIN user u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `;

  const sqlAverage = `SELECT rating FROM product WHERE id = ?`;

  db.query(sqlReviews, [product_id], (err, reviewResults) => {
    if (err) {
      console.error('❌ Помилка при отриманні відгуків:', err);
      return res.status(500).json({ error: 'Не вдалося отримати відгуки' });
    }

    // додаємо поле stars
    const reviewsWithStars = reviewResults.map(r => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(i <= r.rating ? '#407948' : '#ADB9AE');
      }
      return {
        user: r.user_name,
        rating: r.rating,
        comment: r.comment,
        stars
      };
    });

    // отримаємо середній рейтинг
    db.query(sqlAverage, [product_id], (err, avgResult) => {
      if (err) {
        console.error('❌ Помилка при отриманні рейтингу товару:', err);
        return res.status(500).json({ error: 'Не вдалося отримати рейтинг' });
      }

      const average = avgResult[0].avg_rating || 0;

      res.json({
        reviews: reviewsWithStars,
        average
      });
    });
  });
};
