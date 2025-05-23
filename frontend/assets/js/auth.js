// FRONTEND/assets/js/auth.js

// Базовий URL для загальних API-запитів (login, register)
const API_BASE_URL_GENERAL = 'http://localhost:3000/api';
// Базовий URL для користувацьких дій (account, favorites, cart, etc.)
const API_BASE_URL_USER_ACTIONS = 'http://localhost:3000/api/user';


export const login = async (email, password) => {
    try {
        // Звертаємося до /api/login
        const response = await fetch(`${API_BASE_URL_GENERAL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Невідома помилка');
        }
    } catch (error) {
        throw new Error('Помилка з’єднання або сервера: ' + error.message);
    }
};

export const register = async (first_name, last_name, email, password, phone, birthday) => {
    try {
        // Звертаємося до /api/register
        const response = await fetch(`${API_BASE_URL_GENERAL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                first_name,
                last_name,
                email,
                password,
                phone,
                birthday
            }),
        });

        const data = await response.json();

        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Помилка реєстрації');
        }
    } catch (error) {
        throw new Error('Помилка реєстрації: ' + (error.message || 'Мережева помилка'));
    }
};

export const getAccountData = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Необхідна авторизація. Токен відсутній.');
        }

        // ЗВЕРНІТЬ УВАГУ: Тепер це /api/v1/user/account
        const response = await fetch(`${API_BASE_URL_USER_ACTIONS}/account`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const data = await response.json();

        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Не вдалося завантажити дані акаунта');
        }
    } catch (error) {
        throw new Error('Помилка отримання даних акаунта: ' + error.message);
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    alert('Ви успішно вийшли з акаунта!');
    window.location.href = "/page/sign-in.html";
};

// Додайте інші функції для favorites, cart, card, change-password,
// використовуючи API_BASE_URL_USER_ACTIONS або API_BASE_URL_CART, якщо у вас окремі файли для кошика
/*
export const getUserFavorites = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Необхідна авторизація.');
    const response = await fetch(`${API_BASE_URL_USER_ACTIONS}/favorites`, { // Припускаючи, що роут /favorites є в userActions.js
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Помилка отримання улюблених.');
    return data;
};
*/