// FRONTEND/assets/js/product-page.js

document.addEventListener('DOMContentLoaded', async () => { // Зробили головну функцію async
    // ----------------------------------------------------
    // Логіка для кнопок кількості (+/-)
    // ----------------------------------------------------
    const quantityControls = document.querySelector('.quantity-controls');
    let currentQuantity = 1; // Дефолтна кількість

    if (quantityControls) {
        const minusButton = quantityControls.querySelector('.minus');
        const plusButton = quantityControls.querySelector('.plus');
        const quantitySpan = quantityControls.querySelector('.quantity');

        quantitySpan.textContent = currentQuantity;

        minusButton.addEventListener('click', () => {
            if (currentQuantity > 1) {
                currentQuantity--;
                quantitySpan.textContent = currentQuantity;
            }
        });

        plusButton.addEventListener('click', () => {
            currentQuantity++;
            quantitySpan.textContent = currentQuantity;
        });
    }

    // ----------------------------------------------------
    // Отримання ID продукту з URL або data-атрибута
    // ----------------------------------------------------
    let productId = null;
    const productInfoContainer = document.querySelector('.product-info'); // Це ваш div.product-info

    // Спочатку спробуємо отримати ID з data-product-id (якщо він є)
    if (productInfoContainer && productInfoContainer.dataset.productId) {
        productId = productInfoContainer.dataset.productId;
    } else {
        // Якщо data-product-id немає, спробуємо витягти з URL
        const pathSegments = window.location.pathname.split('/');
        const potentialProductId = pathSegments[pathSegments.length - 1];
        if (!isNaN(potentialProductId) && parseInt(potentialProductId) > 0) {
            productId = parseInt(potentialProductId);
        }
    }

    if (!productId) {
        console.error('Не вдалося визначити product ID. Перевірте HTML або URL.');
        alert('Помилка: ID продукту не визначено. Неможливо завантажити дані.');
        return; // Зупиняємо виконання, якщо ID немає
    }

    // ----------------------------------------------------
    // ЗАВАНТАЖЕННЯ ДЕТАЛЕЙ ПРОДУКТУ З БЕКЕНДУ
    // ----------------------------------------------------
    let productDetails = null;
    try {
        const response = await fetch(`/api/products/${productId}`); // Запит на новий ендпоінт
        const data = await response.json();

        if (response.ok && data.status === 'success') {
            productDetails = data.product;
            console.log('Дані про продукт завантажені:', productDetails);

            // Оновити ціну на сторінці, якщо потрібно (наприклад, якщо у вас ціна завантажується JS)
            const priceElement = document.querySelector('.product-price');
            if (priceElement && productDetails.price) {
                priceElement.textContent = `${productDetails.price} ₴`; // Оновлюємо ціну
            }
            // Ви також можете оновити назву, опис, зображення тощо з productDetails
            // const nameElement = document.querySelector('.product-info h3');
            // if (nameElement) nameElement.textContent = productDetails.name;
        } else {
            console.error('Помилка при завантаженні даних про продукт:', data.message);
            alert(data.message || 'Не вдалося завантажити інформацію про продукт.');
            return;
        }
    } catch (error) {
        console.error('Мережева помилка при завантаженні деталей продукту:', error);
        alert('Помилка з\'єднання при завантаженні інформації про продукт.');
        return;
    }

    // ----------------------------------------------------
    // Логіка для кнопки "Придбати" (Add to Cart)
    // ----------------------------------------------------
    const addToCartButton = document.querySelector('.buy-like .lite_btn');

    if (addToCartButton) {
        addToCartButton.addEventListener('click', async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Будь ласка, увійдіть, щоб додати товар до кошика.');
                window.location.href = '/login';
                return;
            }

            // Використовуємо дані, ЗАВАНТАЖЕНІ З БАЗИ ДАНИХ
            const finalProductId = productDetails.id;
            const finalProductPrice = productDetails.price; // Ціна береться з БД
            const quantity = parseInt(document.querySelector('.quantity-controls .quantity').textContent);

            if (!finalProductId || isNaN(finalProductPrice) || isNaN(quantity) || quantity <= 0) {
                console.error('Неповна інформація про товар для додавання в кошик. Деталі:', {
                    productId: finalProductId,
                    price: finalProductPrice,
                    quantity: quantity
                });
                alert('Виникла помилка при додаванні товару до кошика. Перевірте дані.');
                return;
            }

            const productData = {
                productId: finalProductId,
                quantity: quantity,
                price: finalProductPrice // Передаємо ціну з БД
            };

            console.log('Дані для відправки в кошик на бекенд:', productData);

            try {
                const response = await fetch('/api/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(productData),
                });

                const responseData = await response.json();

                if (response.ok) {
                    alert(responseData.message || 'Товар успішно додано до кошика!');
                } else {
                    alert(responseData.message || 'Помилка при додаванні товару до кошика.');
                    console.error('Помилка від бекенду:', responseData);
                }

            } catch (error) {
                console.error('Мережева помилка або помилка запиту:', error);
                alert('Сталася помилка при з\'єднанні з сервером. Спробуйте пізніше.');
            }
        });
    } else {
        console.warn('Кнопка "Придбати" (.buy-like .lite_btn) не знайдена.');
    }
});