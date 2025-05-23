// backend/controllers/cartController.js

const db = require('../models/db'); // Припускаємо, що db.js експортує promise-based пул (mysql2/promise)

// Функція для додавання товару до кошика або оновлення його кількості
exports.addToCart = async (req, res) => {
    const userId = req.userId; // Отримуємо user_id з middleware isAuthenticated
    const { productId, quantity, price } = req.body; // attributeId ВИДАЛЕНО

    if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ status: 'error', message: 'Необхідні productId та quantity (повинен бути > 0).' });
    }
    if (price === undefined || price <= 0) {
           return res.status(400).json({ status: 'error', message: 'Необхідна ціна товару (price > 0).' });
    }

    try {
        // SQL-запит без attribute_id
        const sql = `
            INSERT INTO shopping_cart (user_id, product_id, amount, price)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE amount = amount + VALUES(amount), price = VALUES(price)
        `;
        // Примітка: VALUES(amount) посилається на значення, передане в INSERT.

        await db.execute(sql, [userId, productId, quantity, price]);

        return res.status(201).json({ status: 'success', message: 'Товар додано/оновлено в кошику.' });
    } catch (error) {
        console.error('❌ Помилка при додаванні/оновленні кошика:', error);
        return res.status(500).json({ status: 'error', message: 'Помилка сервера при роботі з кошиком.' });
    }
};

// Функція для отримання вмісту кошика для користувача
exports.getCartItems = async (req, res) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(400).json({ message: 'ID користувача відсутній.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        const [cartItems] = await connection.execute(
            `SELECT
                sc.product_id,
                sc.amount,
                sc.price,
                p.name,
                p.current_price, -- Можливо, вам знадобиться актуальна ціна з таблиці продукту, а не лише з кошика
                p.name_of_product_photo -- Правильна назва стовпця для фото
            FROM
                shopping_cart sc
            JOIN
                product p ON sc.product_id = p.id
            WHERE
                sc.user_id = ?`,
            [userId]
        );

        res.status(200).json({ message: 'Товари кошика успішно отримано.', cartItems: cartItems });

    } catch (error) {
        console.error('Помилка отримання товарів кошика:', error);
        res.status(500).json({ message: 'Помилка сервера при отриманні товарів кошика.' });
    } finally {
        if (connection) connection.release();
    }
};

// Функція для оновлення кількості товару в кошику
exports.updateCartItemQuantity = async (req, res) => {
    const userId = req.userId; // Отримуємо user_id з middleware isAuthenticated
    const { productId, quantity } = req.body; // attributeId ВИДАЛЕНО

    if (!productId || quantity === undefined || quantity < 0) { // Перевірка на quantity >= 0 для оновлення
        return res.status(400).json({ status: 'error', message: 'Необхідні productId та quantity (повинен бути >= 0).' });
    }

    try {
        if (quantity === 0) {
            // Якщо кількість 0, видаляємо товар з кошика
            const sqlDelete = `DELETE FROM shopping_cart WHERE user_id = ? AND product_id = ?`;
            const [resultDelete] = await db.execute(sqlDelete, [userId, productId]);
            if (resultDelete.affectedRows === 0) {
                return res.status(404).json({ status: 'error', message: 'Товар не знайдено в кошику для видалення.' });
            }
            return res.status(200).json({ status: 'success', message: 'Товар видалено з кошика (кількість 0).' });
        } else {
            // SQL-запит без attribute_id у WHERE
            const sqlUpdate = `
                UPDATE shopping_cart
                SET amount = ?
                WHERE user_id = ? AND product_id = ?
            `;
            const [resultUpdate] = await db.execute(sqlUpdate, [quantity, userId, productId]);

            if (resultUpdate.affectedRows === 0) {
                return res.status(404).json({ status: 'error', message: 'Товар не знайдено в кошику або кількість не змінено.' });
            }

            return res.status(200).json({ status: 'success', message: 'Кількість товару оновлено.' });
        }
    } catch (error) {
        console.error('❌ Помилка при оновленні кількості товару в кошику:', error);
        return res.status(500).json({ status: 'error', message: 'Помилка сервера при оновленні кошика.' });
    }
};

// Функція для видалення товару з кошика
exports.removeCartItem = async (req, res) => { // <<< ЦЯ ФУНКЦІЯ БУЛА НЕ ЕКСПОРТОВАНА РАНІШЕ
    const userId = req.userId; // Отримуємо user_id з middleware isAuthenticated
    const { productId } = req.params; // attributeId ВИДАЛЕНО з параметрів URL

    if (!productId) {
        return res.status(400).json({ status: 'error', message: 'Необхідний productId для видалення.' });
    }

    try {
        // SQL-запит без attribute_id у WHERE
        const sql = `DELETE FROM shopping_cart WHERE user_id = ? AND product_id = ?`;
        const [result] = await db.execute(sql, [userId, productId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Товар не знайдено в кошику або не видалено.' });
        }

        return res.status(200).json({ status: 'success', message: 'Товар видалено з кошика.' });
    } catch (error) {
        console.error('❌ Помилка при видаленні товару з кошика:', error);
        return res.status(500).json({ status: 'error', message: 'Помилка сервера при видаленні товару.' });
    }
};