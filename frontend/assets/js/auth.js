const API_BASE_URL_GENERAL = 'http://localhost:3000/api';
const API_BASE_URL_USER_ACTIONS = 'http://localhost:3000/api/user';


export const login = async (email, password) => {
    try {
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
