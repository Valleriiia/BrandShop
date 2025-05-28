const pool = require('../models/db');
const bcrypt = require('bcryptjs');

const getCardByUserId = async (userId) => {
    try {
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
        const hashedCvv = await bcrypt.hash(cvv, 10); 
        const [month, year] = expiryDate.split('/');
        const formattedExpiryDate = `${year}-${month}-01`; 

        if (existingCard) {
            await connection.execute(
                'UPDATE credit_card SET number = ?, date = ?, cvv = ? WHERE user_id = ?',
                [cardNumber, formattedExpiryDate, hashedCvv, userId]
            );
            await connection.commit();
            return { message: 'Дані картки успішно оновлено.' };
        } else {
            const [result] = await connection.execute(
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