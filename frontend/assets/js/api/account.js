document.addEventListener('DOMContentLoaded', () => {
    const changePasswordForm = document.querySelector('.tab-content.info form:last-of-type');

    const cardTabLabel = document.querySelector('label[for="tab3"]');
    const cardTabContent = document.getElementById('content3'); 
    const ordersTabLabel = document.querySelector('label[for="tab2"]');

    const cardForm = document.getElementById('card-form');
    const cardNumberInput = document.getElementById('card-number');
    const expiryDateInput = document.getElementById('expiry-date');
    const cvvInput = document.getElementById('cvv');
    const cardSubmitButton = document.getElementById('card-submit-button');

    let isEditingCard = false; 

    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const oldPass = document.getElementById('old-pass').value;
            const newPass = document.getElementById('new-pass').value;
            const confirmPass = document.getElementById('confirm-pass').value;

            if (!oldPass || !newPass || !confirmPass) {
                alert('Будь ласка, заповніть всі поля пароля.');
                return;
            }
            if (newPass !== confirmPass) {
                alert('Новий пароль та підтвердження не співпадають.');
                return;
            }
            if (newPass.length < 6) {
                alert('Новий пароль має бути щонайменше 6 символів.');
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                alert('Ви не авторизовані. Будь ласка, увійдіть.');
                window.location.href = '/login.html';
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/user/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        old_pass: oldPass,
                        new_pass: newPass,
                        confirm_pass: confirmPass
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    document.getElementById('old-pass').value = '';
                    document.getElementById('new-pass').value = '';
                    document.getElementById('confirm-pass').value = '';
                } else {
                    if (response.status === 401 || response.status === 403) {
                        alert('Сесія закінчилася або недійсна. Будь ласка, увійдіть знову.');
                        localStorage.removeItem('token');
                        localStorage.removeItem('userId');
                        window.location.href = '/login.html';
                    } else {
                        alert('Помилка: ' + (data.message || 'Невідома помилка.'));
                    }
                }
            } catch (error) {
                console.error('Помилка мережі або сервера при зміні пароля:', error);
                alert('Сталася помилка при спробі змінити пароль. Спробуйте пізніше.');
            }
        });
    }

    const loadCardData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('Токен відсутній, неможливо завантажити дані картки.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/user/card', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (cardNumberInput && expiryDateInput && cvvInput && cardSubmitButton) {
                if (response.ok && data.card) {
                    cardNumberInput.value = `**** **** **** ${data.card.last4 || ''}`;
                    cardNumberInput.readOnly = true;
                    expiryDateInput.value = data.card.expiry_date || '';
                    expiryDateInput.readOnly = true;

                    cardSubmitButton.textContent = 'Оновити дані картки';
                    isEditingCard = false;
                    cvvInput.value = '';
                    cvvInput.readOnly = true;
                } else {
                    cardNumberInput.value = '';
                    cardNumberInput.readOnly = false;
                    expiryDateInput.value = '';
                    expiryDateInput.readOnly = false;
                    cvvInput.value = '';
                    cvvInput.readOnly = false;
                    cardSubmitButton.textContent = 'Додати картку';
                    isEditingCard = true; 
                }
            } else {
                console.warn("Один або кілька елементів форми картки не знайдено. Перевірте HTML.");
                alert('Виникла проблема з відображенням форми картки. Спробуйте пізніше.');
            }
        } catch (error) {
            console.error('Помилка завантаження даних картки:', error);
            alert('Не вдалося завантажити дані картки. Спробуйте пізніше.');
        }
    };

    if (cardTabLabel) {
        cardTabLabel.addEventListener('click', () => {
            loadCardData();
        });
    }

    if (cardForm) {
        cardForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!isEditingCard) {
                cardNumberInput.value = ''; 
                cardNumberInput.readOnly = false;
                expiryDateInput.value = ''; 
                expiryDateInput.readOnly = false;
                cvvInput.value = ''; 
                cvvInput.readOnly = false; 
                cardSubmitButton.textContent = 'Зберегти зміни'; 
                isEditingCard = true; 
                return; 
            }

            const token = localStorage.getItem('token');
            if (!token) {
                alert('Ви не авторизовані. Будь ласка, увійдіть.');
                window.location.href = '/login.html';
                return;
            }

            const cardNumber = cardNumberInput.value;
            const expiryDate = expiryDateInput.value;
            const cvv = cvvInput.value;

            if (!cardNumber || !expiryDate || !cvv) {
                alert('Будь ласка, заповніть всі обов\'язкові поля картки.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/user/card', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        cardNumber: cardNumber.replace(/\s/g, ''),
                        expiryDate,
                        cvv
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    loadCardData(); 
                } else {
                    if (response.status === 401 || response.status === 403) {
                        alert('Сесія закінчилася або недійсна. Будь ласка, увійдіть знову.');
                        localStorage.removeItem('token');
                        localStorage.removeItem('userId');
                        window.location.href = '/login.html';
                    } else {
                        alert('Помилка: ' + (data.message || 'Невідома помилка.'));
                    }
                }
            } catch (error) {
                console.error('Помилка мережі або сервера при оновленні картки:', error);
                alert('Сталася помилка при спробі оновити дані картки. Спробуйте пізніше.');
            }
        });
    }

    async function loadOrders() {
    const ordersListBody = document.getElementById('ordersListBody');
    const noOrdersMessage = document.getElementById('noOrdersMessage');

    ordersListBody.innerHTML = '';
    noOrdersMessage.classList.add('hidden'); 

    try {
        const token = localStorage.getItem('token'); 

        if (!token) {
            console.error('Токен авторизації відсутній.');
            noOrdersMessage.textContent = 'Будь ласка, увійдіть, щоб переглянути замовлення.';
            noOrdersMessage.classList.remove('hidden');
            return;
        }

        const response = await fetch('http://localhost:3000/api/user/orders', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.error('Помилка авторизації при завантаженні замовлень.');
                noOrdersMessage.textContent = 'Сесія закінчилася або токен недійсний. Будь ласка, увійдіть знову.';
                noOrdersMessage.classList.remove('hidden');
            } else {
                console.error('Помилка при завантаженні замовлень:', response.statusText);
                noOrdersMessage.textContent = 'Не вдалося завантажити замовлення. Спробуйте пізніше.';
                noOrdersMessage.classList.remove('hidden');
            }
            return;
        }

        const orders = await response.json();

        if (orders.length === 0) {
            noOrdersMessage.classList.remove('hidden'); 
        } else {
            orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="order-num">${order.order_id}</td>
                    <td class="order-date">${new Date(order.order_date).toLocaleDateString()}</td>
                    <td>${order.status}</td>
                    <td class="order-all">${order.total_amount} ₴</td>
                     <td class="order-amount">${order.total_items_amount}</td>
                `;
                ordersListBody.appendChild(row);
            });
        }

    } catch (error) {
        console.error('Мережева помилка при завантаженні замовлень:', error);
        noOrdersMessage.textContent = 'Сталася помилка мережі. Перевірте підключення.';
        noOrdersMessage.classList.remove('hidden');
    }
}

if (ordersTabLabel) {
        ordersTabLabel.addEventListener('click', () => {
            console.log('[FRONTEND] Завантажуємо історію замовлень...');
            loadOrders();
        });
    }
});