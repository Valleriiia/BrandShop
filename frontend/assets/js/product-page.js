document.addEventListener('DOMContentLoaded', async () => { 
    const quantityControls = document.querySelector('.quantity-controls');
    let currentQuantity = 1; 

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
    let productId = null;
    const productInfoContainer = document.querySelector('.product-info');
    if (productInfoContainer && productInfoContainer.dataset.productId) {
        productId = productInfoContainer.dataset.productId;
    } else {
        const pathSegments = window.location.pathname.split('/');
        const potentialProductId = pathSegments[pathSegments.length - 1];
        if (!isNaN(potentialProductId) && parseInt(potentialProductId) > 0) {
            productId = parseInt(potentialProductId);
        }
    }

    if (!productId) {
        console.error('Не вдалося визначити product ID. Перевірте HTML або URL.');
        alert('Помилка: ID продукту не визначено. Неможливо завантажити дані.');
        return; 
    }
    let productDetails = null;
    try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();

        if (response.ok && data.status === 'success') {
            productDetails = data.product;
            console.log('Дані про продукт завантажені:', productDetails);
            const priceElement = document.querySelector('.product-price');
            if (priceElement && productDetails.price) {
                priceElement.textContent = `${productDetails.price} ₴`; 
            }
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
    const addToCartButton = document.querySelector('.buy-like .lite_btn');

    if (addToCartButton) {
        addToCartButton.addEventListener('click', async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Будь ласка, увійдіть, щоб додати товар до кошика.');
                window.location.href = '/login';
                return;
            }
            const finalProductId = productDetails.id;
            const finalProductPrice = productDetails.price;
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
                price: finalProductPrice
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