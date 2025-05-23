// backend/controllers/cardController.js
const pool = require('../models/db');
const bcrypt = require('bcryptjs');

const getCardByUserId = async (userId) => {
    try {
        // Змінено назву таблиці на 'credit_card'
        // Змінено колонки на 'cvv', 'number', 'date' відповідно до вашої схеми
        const [rows] = await pool.execute(
            'SELECT cvv, number, date FROM credit_card WHERE user_id = ? LIMIT 1',
            [userId]
        );
        return rows[0] || null;
    } catch (error) {
        console.error('Помилка при отриманні картки користувача:', error);
        throw error;
    }
};

const addOrUpdateCard = async (userId, cardNumber, expiryDate, cvv) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const existingCard = await getCardByUserId(userId);

        // НЕ РЕКОМЕНДУЄТЬСЯ ЗБЕРІГАТИ CVV, НАВІТЬ ХЕШОВАНИМ, В ПРОДАКШЕНІ.
        // Для курсової роботи це допустимо, але з розумінням ризиків.
        const hashedCvv = await bcrypt.hash(cvv, 10); // Хешуємо CVV

        // Перетворення expiryDate (MM/YYYY) у формат Date для MySQL 'YYYY-MM-DD'
        // Важливо: ваша колонка `date` має тип `DATE`. Це значить, що вона зберігає YYYY-MM-DD.
        // Для картки термін дії - це MM/YYYY. Ми зберігаємо її як YYYY-MM-01.
        const [month, year] = expiryDate.split('/');
        const formattedExpiryDate = `${year}-${month}-01`; // Перетворюємо в YYYY-MM-01

        if (existingCard) {
            // Оновлюємо існуючу картку
            await connection.execute(
                // Змінено назву таблиці на 'credit_card'
                // Змінено назви колонок на 'number', 'date', 'cvv'
                'UPDATE credit_card SET number = ?, date = ?, cvv = ? WHERE user_id = ?',
                [cardNumber, formattedExpiryDate, hashedCvv, userId]
            );
            await connection.commit();
            return { message: 'Дані картки успішно оновлено.' };
        } else {
            // Додаємо нову картку
            const [result] = await connection.execute(
                // Змінено назву таблиці на 'credit_card'
                // Змінено назви колонок на 'user_id', 'number', 'date', 'cvv'
                'INSERT INTO credit_card (user_id, number, date, cvv) VALUES (?, ?, ?, ?)',
                [userId, cardNumber, formattedExpiryDate, hashedCvv]
            );
            await connection.commit();
            return { message: 'Дані картки успішно додано.', cardId: result.insertId };
        }
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Помилка при додаванні/оновленні картки:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    getCardByUserId,
    addOrUpdateCard,
};