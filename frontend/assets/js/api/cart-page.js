function getToken() {
    return localStorage.getItem('token');
}

function displayCartItems(items) {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummaryPriceElement = document.querySelector('.cart-summary-price');
    const cartTotalPriceElement = document.querySelector('.cart-total-price');

    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    if (!items || items.length === 0) {
        cartItemsContainer.innerHTML = '<p>Ваш кошик порожній.</p>';
        cartSummaryPriceElement.textContent = '0.00 ₴';
        cartTotalPriceElement.textContent = '0.00 ₴';
        return;
    }

    items.forEach(item => {
        const pricePerItem = parseFloat(item.current_price || item.item_added_price);
        const itemAmount = parseInt(item.amount);

        if (isNaN(pricePerItem) || isNaN(itemAmount)) {
            console.warn(`Некоректні дані для товару ${item.name || item.product_id}`);
            return;
        }

        const itemTotalPrice = pricePerItem * itemAmount;
        subtotal += itemTotalPrice;

        const imageUrl = item.name_of_product_photo
            ? `/assets/img/${item.name_of_product_photo}img1.png`
            : '/assets/img/placeholder.png';

        const cartItemHTML = `
            <div class="cart-item item" data-product-id="${item.product_id}">
                <div class="item-top">
                    <img src="${imageUrl}" alt="${item.name}">
                    <div class="item-text">
                        <p class="item-title">${item.name}</p>
                        <p class="item-desc">Ціна за одиницю: ${pricePerItem.toFixed(2)} ₴</p>
                        <p class="item-price">${itemTotalPrice.toFixed(2)} ₴</p>
                    </div>
                    <button class="remove-btn" data-product-id="${item.product_id}">+</button>
                </div>
                <div class="quantity-controls">
                    <span class="quantity" data-product-id="${item.product_id}">${item.amount}</span>
                </div>
            </div>
        `;
        cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
    });

    cartSummaryPriceElement.textContent = `${subtotal.toFixed(2)} ₴`;
    cartTotalPriceElement.textContent = `${subtotal.toFixed(2)} ₴`;
}

function attachRemoveButtonListeners() {
    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach(button => {
        if (!button.dataset.listenerAttached) {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                if (productId) {
                    removeItem(productId);
                }
            });
            button.dataset.listenerAttached = 'true';
        }
    });
}

async function loadUserProfile() {
    const token = getToken();
    if (!token) {
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/user/account', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
            }
            console.error('Помилка завантаження даних профілю:', response.statusText);
            return;
        }

        const data = await response.json();
        if (data.user) {
            const user = data.user;
            document.getElementById('name').value = user.first_name || '';
            document.getElementById('surname').value = user.last_name || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('email').value = user.email || '';
        }

    } catch (error) {
        console.error('Помилка при отриманні даних профілю:', error);
    }
}

async function loadCardDetails() {
    const token = getToken();
    if (!token) {
        document.getElementById('cardNumberDisplay').value = 'Немає даних картки';
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

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
            }
            console.error('Помилка завантаження даних картки:', response.statusText);
            document.getElementById('cardNumberDisplay').value = 'Помилка завантаження';
            return;
        }

        const data = await response.json();
        const cardNumberDisplayField = document.getElementById('cardNumberDisplay');

        if (data.card && data.card.last4) {
            cardNumberDisplayField.value = `**** **** **** ${data.card.last4}`;
        } else {
            cardNumberDisplayField.value = 'Дані картки відсутні';
        }

    } catch (error) {
        console.error('Помилка при отриманні даних картки:', error);
        document.getElementById('cardNumberDisplay').value = 'Помилка завантаження';
    }
}


async function loadCartItems() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummaryPriceElement = document.querySelector('.cart-summary-price');
    const cartTotalPriceElement = document.querySelector('.cart-total-price');

    const token = getToken();
    if (!token) {
        cartItemsContainer.innerHTML = '<p>Будь ласка, увійдіть, щоб переглянути ваш кошик.</p>';
        cartSummaryPriceElement.textContent = '0 ₴';
        cartTotalPriceElement.textContent = '0 ₴';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/user/cart', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                cartItemsContainer.innerHTML = '<p>Сесія закінчилася. Будь ласка, увійдіть знову.</p>';
            } else {
                cartItemsContainer.innerHTML = '<p>Помилка завантаження товарів кошика.</p>';
            }
            return;
        }

        const data = await response.json();

        if (data.cartItems && data.cartItems.length > 0) {
            displayCartItems(data.cartItems);
        } else {
            cartItemsContainer.innerHTML = '<p>Ваш кошик порожній.</p>';
            cartSummaryPriceElement.textContent = '0 ₴';
            cartTotalPriceElement.textContent = '0 ₴';
        }

    } catch (error) {
        console.error('Помилка під час отримання товарів кошика:', error);
        cartItemsContainer.innerHTML = '<p>Не вдалося підключитися до сервера. Спробуйте пізніше.</p>';
    }
}

async function removeItem(productId) {
    const token = getToken();
    if (!token) {
        alert('Ви не авторизовані. Будь ласка, увійдіть.');
        return;
    }

    const confirmRemoval = confirm('Ви впевнені, що хочете видалити цей товар з кошика?');
    if (!confirmRemoval) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/user/cart/remove/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Помилка при видаленні товару з кошика.');
        }

        const data = await response.json();
        alert(data.message);

        await loadCartItems();
        await loadUserProfile();
        await loadCardDetails();
        attachRemoveButtonListeners();

    } catch (error) {
        console.error('Помилка видалення:', error);
        alert(`Не вдалося видалити товар: ${error.message}`);
    }
}

async function placeOrder() {
    const token = getToken();
    if (!token) {
        alert('Ви не авторизовані. Будь ласка, увійдіть, щоб оформити замовлення.');
        return;
    }

    const confirmOrder = confirm('Ви впевнені, що хочете оформити замовлення?');
    if (!confirmOrder) {
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/user/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Помилка при оформленні замовлення.');
        }

        const data = await response.json();
        alert(data.message);

        await loadCartItems();
        await loadUserProfile();
        await loadCardDetails(); 
        attachRemoveButtonListeners();

    } catch (error) {
        console.error('Помилка оформлення замовлення:', error);
        alert(`Не вдалося оформити замовлення: ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadCartItems();
    await loadUserProfile();
    await loadCardDetails();
    attachRemoveButtonListeners();
    const orderButton = document.querySelector('.order');
    if (orderButton) {
        orderButton.addEventListener('click', placeOrder);
    }
});