// backend/controllers/userActionsController.js

const pool = require('../models/db'); // Припускаємо, що models/db.js експортує promise-based пул

// ==== FAVORITES ====

exports.addToFavorites = async (req, res) => {
    const userId = req.userId; // Отримуємо userId з isAuthenticated middleware
    const { productId } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({ message: 'ID користувача та ID продукту є обов\'язковими.' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT IGNORE INTO favourites (user_id, product_id) VALUES (?, ?)',
            [userId, productId]
        );

        if (result.affectedRows === 0) {
            return res.status(200).json({ message: 'Товар вже є в улюблених.' });
        }

        res.status(201).json({ message: 'Товар успішно додано до улюблених.' });
    } catch (error) {
        console.error('Помилка при додаванні в улюблені:', error);
        res.status(500).json({ message: 'Помилка сервера при додаванні в улюблені.' });
    }
};

exports.removeFromFavorites = async (req, res) => {
    const userId = req.userId; // Отримуємо userId з isAuthenticated middleware
    const { productId } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({ message: 'ID користувача та ID продукту є обов\'язковими.' });
    }

    try {
        const [result] = await pool.execute(
            'DELETE FROM favourites WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Товар не знайдено в улюблених або користувача не існує.' });
        }

        res.status(200).json({ message: 'Товар успішно видалено з улюблених.' });
    } catch (error) {
        console.error('Помилка при видаленні з улюблених:', error);
        res.status(500).json({ message: 'Помилка сервера при видаленні з улюблених.' });
    }
};

exports.getFavorites = async (req, res) => {
    const userId = req.userId; // Отримуємо userId з isAuthenticated middleware

    if (!userId) {
        return res.status(400).json({ message: 'ID користувача є обов\'язковим.' });
    }

    try {
        const [favorites] = await pool.execute(
            `
            SELECT p.*
            FROM product p
            JOIN favourites f ON f.product_id = p.id
            WHERE f.user_id = ?
            `,
            [userId]
        );
        res.status(200).json(favorites);
    } catch (error) {
        console.error('Помилка при отриманні улюблених:', error);
        res.status(500).json({ message: 'Помилка сервера при отриманні улюблених.' });
    }
};

// ==== CART (Перенесено з cartController.js) ====

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
        const sql = `
            INSERT INTO shopping_cart (user_id, product_id, amount, price)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE amount = amount + VALUES(amount), price = VALUES(price)
        `;
        await pool.execute(sql, [userId, productId, quantity, price]);

        return res.status(201).json({ status: 'success', message: 'Товар додано/оновлено в кошику.' });
    } catch (error) {
        console.error('❌ Помилка при додаванні/оновленні кошика:', error);
        return res.status(500).json({ status: 'error', message: 'Помилка сервера при роботі з кошиком.' });
    }
};

exports.getCartItems = async (req, res) => {
    const userId = req.userId; // Отримуємо userId з isAuthenticated middleware

    if (!userId) {
        return res.status(400).json({ message: 'ID користувача відсутній.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // SQL-запит для отримання товарів з кошика, об'єднаний з інформацією про товар
        const [cartItems] = await connection.execute(
            `SELECT
                sc.product_id,
                sc.amount,
                sc.price AS item_added_price, -- Даємо аліас, щоб не плутати з p.current_price
                p.name,
                p.current_price, -- Можливо, вам потрібна актуальна ціна товару
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

exports.updateCartItemQuantity = async (req, res) => {
    const userId = req.userId; // Отримуємо user_id з middleware isAuthenticated
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined || quantity < 0) {
        return res.status(400).json({ status: 'error', message: 'Необхідні productId та quantity (повинен бути >= 0).' });
    }

    try {
        if (quantity === 0) {
            const sqlDelete = `DELETE FROM shopping_cart WHERE user_id = ? AND product_id = ?`;
            const [resultDelete] = await pool.execute(sqlDelete, [userId, productId]);
            if (resultDelete.affectedRows === 0) {
                return res.status(404).json({ status: 'error', message: 'Товар не знайдено в кошику для видалення.' });
            }
            return res.status(200).json({ status: 'success', message: 'Товар видалено з кошика (кількість 0).' });
        } else {
            const sqlUpdate = `
                UPDATE shopping_cart
                SET amount = ?
                WHERE user_id = ? AND product_id = ?
            `;
            const [resultUpdate] = await pool.execute(sqlUpdate, [quantity, userId, productId]);

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

exports.removeCartItem = async (req, res) => {
    const userId = req.userId; // Отримуємо user_id з middleware isAuthenticated
    const { productId } = req.params;

    if (!productId) {
        return res.status(400).json({ status: 'error', message: 'Необхідний productId для видалення.' });
    }

    try {
        const sql = `DELETE FROM shopping_cart WHERE user_id = ? AND product_id = ?`;
        const [result] = await pool.execute(sql, [userId, productId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Товар не знайдено в кошику або не видалено.' });
        }

        return res.status(200).json({ status: 'success', message: 'Товар видалено з кошика.' });
    } catch (error) {
        console.error('❌ Помилка при видаленні товару з кошика:', error);
        return res.status(500).json({ status: 'error', message: 'Помилка сервера при видаленні товару.' });
    }
};

exports.removeItemFromCart = async (req, res) => {
    const userId = req.userId; // Отримуємо ID користувача з JWT токена (з authMiddleware)
    const { product_id } = req.params; // Отримуємо product_id з URL-параметрів

    if (!userId) {
        return res.status(401).json({ message: 'Користувач не авторизований.' });
    }
    if (!product_id) {
        return res.status(400).json({ message: 'Не вказано ID продукту для видалення.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // Перевіряємо, чи належить товар цьому користувачу
        const [existingItem] = await connection.execute(
            `SELECT * FROM shopping_cart WHERE user_id = ? AND product_id = ?`,
            [userId, product_id]
        );

        if (existingItem.length === 0) {
            return res.status(404).json({ message: 'Товар не знайдено в кошику цього користувача.' });
        }

        // Видаляємо товар з кошика
        await connection.execute(
            `DELETE FROM shopping_cart WHERE user_id = ? AND product_id = ?`,
            [userId, product_id]
        );

        res.status(200).json({ message: 'Товар успішно видалено з кошика.' });

    } catch (error) {
        console.error('Помилка при видаленні товару з кошика:', error);
        res.status(500).json({ message: 'Помилка сервера при видаленні товару з кошика.' });
    } finally {
        if (connection) connection.release();
    }
};

exports.placeOrder = async (req, res) => {
    const userId = req.userId; // ID користувача з JWT

    if (!userId) {
        return res.status(401).json({ message: 'Користувач не авторизований.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction(); // Починаємо транзакцію

        const today = new Date().toISOString().slice(0, 10);

        // 1. Отримуємо всі товари з кошика користувача
        const [cartItems] = await connection.execute(
            `SELECT
        sc.product_id,
        sc.amount,
        p.price as price_at_order  
     FROM shopping_cart sc
     JOIN product p ON sc.product_id = p.id
     WHERE sc.user_id = ?`,
    [userId]
        );

        if (cartItems.length === 0) {
            await connection.rollback(); // Відкочуємо транзакцію, якщо кошик порожній
            return res.status(400).json({ message: 'Ваш кошик порожній. Неможливо оформити замовлення.' });
        }

        // 2. Вставляємо товари з кошика в order_history
        const orderPromises = cartItems.map(item => {
    return connection.execute(
        `INSERT INTO order_history (user_id, product_id, amount, price, order_date, status)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
             amount = amount + VALUES(amount),
             price = VALUES(price),
             status = VALUES(status)
        `,
        [userId, item.product_id, item.amount, item.price_at_order, today, 1] // Змінено на item.price_at_order
    );
});

        await Promise.all(orderPromises); // Чекаємо виконання всіх вставок

        // 3. Очищаємо кошик користувача
        await connection.execute(
            `DELETE FROM shopping_cart WHERE user_id = ?`,
            [userId]
        );

        await connection.commit(); // Завершуємо транзакцію (фіксуємо зміни)
        res.status(200).json({ message: 'Замовлення успішно оформлено!', orderId: null }); // orderId поки null, бо у нас немає таблиці orders
                                                                                             // але ми можемо повернути щось інше, якщо буде потрібно
    } catch (error) {
        if (connection) {
            await connection.rollback(); // Відкочуємо транзакцію у випадку помилки
        }
        console.error('Помилка при оформленні замовлення:', error);
        res.status(500).json({ message: 'Помилка сервера при оформленні замовлення.' });
    } finally {
        if (connection) connection.release();
    }
};

exports.getUserOrders = async(req, res) =>{
    const userId = req.userId; // ID користувача отримуємо з токена

    let connection;
    try {
        connection = await pool.getConnection();

        // Запит для отримання згрупованих замовлень
        const [orders] = await connection.execute(
            `SELECT
                user_id,
                order_date,
                status,
                SUM(amount * price) AS total_amount,
                SUM(amount) AS total_items_amount -- <--- ЦЕЙ РЯДОК УЖЕ Є І ЦЕ ПРАВИЛЬНО
             FROM
                order_history
             WHERE
                user_id = ?
             GROUP BY
                user_id, order_date, status
             ORDER BY
                order_date DESC`,
            [userId]
        );

        // Форматуємо замовлення і додаємо простий порядковий номер
        const formattedOrders = orders.map((order, index) => {
            return {
                order_id: index + 1,
                order_date: order.order_date,
                status: order.status,
                total_amount: parseFloat(order.total_amount).toFixed(2),
                // --- ДОДАЙТЕ ЦЕЙ РЯДОК: ---
                total_items_amount: parseInt(order.total_items_amount, 10) // Парсимо в ціле число
            };
        });

        res.status(200).json(formattedOrders);

    } catch (error) {
        console.error(`[CONTROLLER ERROR] Помилка у getUserOrders для userId: ${userId}`);
        console.error('Повідомлення:', error.message);
        console.error('Стек викликів:', error.stack);
        console.error('Об\'єкт помилки:', error);
        res.status(500).json({ message: 'Помилка сервера при отриманні історії замовлень.' });
    } finally {
        if (connection) connection.release();
    }
};



exports.getAccountData = async (req, res) => {
    const userId = req.userId; // Отримуємо userId з isAuthenticated middleware

    if (!userId) {
        return res.status(400).json({ message: 'ID користувача відсутній.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT id, first_name, last_name, email, phone, birthday, name_of_user_photo FROM user WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Дані облікового запису не знайдено.' });
        }

        const userData = rows[0];
        res.status(200).json({ message: 'Дані облікового запису успішно отримано.', user: userData });

    } catch (error) {
        console.error('Помилка отримання даних акаунта:', error);
        res.status(500).json({ message: 'Помилка сервера при отриманні даних акаунта.' });
    } finally {
        if (connection) connection.release();
    }
};