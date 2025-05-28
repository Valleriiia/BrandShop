const db = require('../models/db');

// ==== FAVORITES ====

exports.addToFavorites = async (req, res) => {
    const { user_id, product_id } = req.body;
    const sql = `INSERT IGNORE INTO favourites (user_id, product_id) VALUES (?, ?)`;
    try {
        await db.query(sql, [user_id, product_id]);
        res.json({ message: 'Додано в улюблені' });
    } catch (error) {
        console.error('Помилка при додаванні в улюблені:', error);
        res.status(500).json({ error: 'Помилка при додаванні в улюблені' });
    }
};

exports.removeFromFavorites = async (req, res) => {
    const { user_id, product_id } = req.body;
    const sql = `DELETE FROM favourites WHERE user_id = ? AND product_id = ?`;
    try {
        await db.query(sql, [user_id, product_id]);
        res.json({ message: 'Видалено з улюблених' });
    } catch (error) {
        console.error('Помилка при видаленні з улюблених:', error);
        res.status(500).json({ error: 'Помилка при видаленні з улюблених' });
    }
};

exports.getFavorites = async (req, res) => {
    const user_id = req.params.userId;
    const sql = `
        SELECT p.*
        FROM product p
        JOIN favourites f ON f.product_id = p.id
        WHERE f.user_id = ?
    `;
    try {
        const [results] = await db.query(sql, [user_id]);
        res.json(results);
    } catch (error) {
        console.error('Помилка при отриманні улюблених:', error);
        res.status(500).json({ error: 'Помилка при отриманні улюблених' });
    }
};

// ==== CART ====
exports.addToCart = async (req, res) => {
    const userId = req.userId; 
    const { productId, quantity, price } = req.body; 

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
    const userId = req.userId; 
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
    const userId = req.userId; 
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
    const userId = req.userId; 
    const { product_id } = req.params; 

    if (!userId) {
        return res.status(401).json({ message: 'Користувач не авторизований.' });
    }
    if (!product_id) {
        return res.status(400).json({ message: 'Не вказано ID продукту для видалення.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [existingItem] = await connection.execute(
            `SELECT * FROM shopping_cart WHERE user_id = ? AND product_id = ?`,
            [userId, product_id]
        );

        if (existingItem.length === 0) {
            return res.status(404).json({ message: 'Товар не знайдено в кошику цього користувача.' });
        }
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
    const userId = req.userId; 

    if (!userId) {
        return res.status(401).json({ message: 'Користувач не авторизований.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction(); 

        const today = new Date().toISOString().slice(0, 10);
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
            await connection.rollback(); 
            return res.status(400).json({ message: 'Ваш кошик порожній. Неможливо оформити замовлення.' });
        }
        const orderPromises = cartItems.map(item => {
    return connection.execute(
        `INSERT INTO order_history (user_id, product_id, amount, price, order_date, status)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
             amount = amount + VALUES(amount),
             price = VALUES(price),
             status = VALUES(status)
        `,
        [userId, item.product_id, item.amount, item.price_at_order, today, 1] 
    );
});

        await Promise.all(orderPromises); 
        await connection.execute(
            `DELETE FROM shopping_cart WHERE user_id = ?`,
            [userId]
        );

        await connection.commit(); 
        res.status(200).json({ message: 'Замовлення успішно оформлено!', orderId: null }); 
    } catch (error) {
        if (connection) {
            await connection.rollback(); 
        }
        console.error('Помилка при оформленні замовлення:', error);
        res.status(500).json({ message: 'Помилка сервера при оформленні замовлення.' });
    } finally {
        if (connection) connection.release();
    }
};

exports.getUserOrders = async(req, res) =>{
    const userId = req.userId; 

    let connection;
    try {
        connection = await pool.getConnection();
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
        const formattedOrders = orders.map((order, index) => {
            return {
                order_id: index + 1,
                order_date: order.order_date,
                status: order.status,
                total_amount: parseFloat(order.total_amount).toFixed(2),
                total_items_amount: parseInt(order.total_items_amount, 10) 
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
    const userId = req.userId;

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