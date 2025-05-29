document.addEventListener('DOMContentLoaded', async () => {
  const productId = window.location.pathname.split('/').pop(); // /product/12 → 12
  const mainImg = document.getElementById('mainImg');
  const thumbnails = document.querySelector('.thumbnails');
  const swiperWrapper = document.querySelector('#swiper4 .swiper-wrapper');
  const breadLink = document.querySelector('.breadcrambs a[href^="/catalog"]');
  const breadText = document.querySelector('.breadcrambs a[href="#"]');
  const cross = document.querySelector('.product-price .cross');
  const currentPrice = document.querySelector('.product-price .current-price');
  const discountEl = document.querySelector('.product-price .discount');
  const desc = document.querySelector('.product-desc .description');
  const colorsContainer = document.querySelector('.colors-container');
  const sizesContainer = document.querySelector('.sizes-container');
  const charContainer = document.querySelector('.product-charact');
  const recomendWrapper = document.getElementById('random-swiper');
  const starsContainer = document.getElementById('stars-container');
  const ratingAverage = document.querySelector('.rating-average');
  const reviewsList = document.querySelector('.reviews-list ul');
  const reviewCountEl = document.querySelector('h3.reviews-number');
  const noReviewsEl = document.getElementById('no-reviews');

  const reviewTempl = await loadTemplate('/assets/js/templates/review-template.mustache');
  const productTmpl = await loadTemplate('/assets/js/templates/product-template.mustache');

  try {
    const res = await fetch(`/api/products/${productId}`);
    const { product, attributes, similar } = await res.json();

    // 1. Хлібні крихти
    breadLink.href = `/catalog/${product.department_slug}`;
    breadLink.textContent = product.department_name;
    breadText.textContent = product.name;

    // 2. Фото (main + thumbnails + swiper4)
    const photoFolder = product.name_of_product_photo;
    const photoPath = `/assets/img/${photoFolder}`;
    const images = await fetchPhotos(photoFolder);

    if (images.length > 0) {
      mainImg.src = `${photoPath}/${images[0]}`;
    }

    thumbnails.innerHTML = '';
    swiperWrapper.innerHTML = '';
    images.forEach((img, i) => {
      const thumb = `<img src="${photoPath}/${img}" alt="thumb${i}" onclick="changeImage('${photoPath}/${img}')">`;
      const slide = `<div class="swiper-slide"><img src="${photoPath}/${img}" alt="Фото ${i}"></div>`;
      thumbnails.insertAdjacentHTML('beforeend', thumb);
      swiperWrapper.insertAdjacentHTML('beforeend', slide);
    });

    // 3. Ціна / знижка
    if (product.discount > 0) {
      cross.textContent = product.price + '₴';
      currentPrice.textContent = product.current_price + '₴';
      discountEl.textContent = `-${product.discount}%`;
    } else {
      cross.style.display = 'none';
      discountEl.style.display = 'none';
      currentPrice.textContent = product.price + '₴';
    }

    // 4. Опис
    desc.textContent = product.description || 'Немає опису';

    // 5. Кольори та розміри

    const colors = new Map();
    const sizes = new Map();

    attributes.forEach(a => {
      if (!colors.has(a.color_id)) {
        colors.set(a.color_id, a.color);
      }
      if (!sizes.has(a.size_id)) {
        sizes.set(a.size_id, a.size);
      }
    });

    colorsContainer.innerHTML = '';
    colors.forEach((name, id) => {
      colorsContainer.insertAdjacentHTML('beforeend', `
        <li>
          <label class="checkbox" for="color-${id}">
            <input type="radio" name="color-item" id="color-${id}" value="${id}">
            ${name}
          </label>
        </li>
      `);
    });

    sizesContainer.innerHTML = '';
    sizes.forEach((name, id) => {
      sizesContainer.insertAdjacentHTML('beforeend', `
        <li>
          <label class="checkbox" for="size-${id}">
            <input type="radio" name="size-item" id="size-${id}" value="${id}">
            ${name}
          </label>
        </li>
      `);
    });

    setupVariantDependency(attributes);

    // 6. Характеристики
    charContainer.innerHTML = `
      <h3>Характеристика</h3>
      <p>Матеріал: ${product.composition}</p>
      <p>Виробник: ${product.country}</p>
    `;

    // 7. Рекомендовані товари
    recomendWrapper.innerHTML = '';
    similar.forEach(p => {
        const html = Mustache.render(productTmpl, p);
          const slide = document.createElement('div');
          slide.className = 'swiper-slide';          
          slide.innerHTML = html; 
        recomendWrapper.appendChild(slide);
    });

     const userId = getUserId();
if (userId) {
  markLikedProducts(userId);
}

    // 8. Відгуки
//     const { reviews, average } = await fetch(`/api/reviews/${productId}`).then(r => r.json());


// if (reviews.length === 0) {
//   noReviewsEl.style.display = 'block';
//   reviewsList.innerHTML = '';
//   reviewCountEl.textContent = `Відгуки (0)`
// } else {
//   noReviewsEl.style.display = 'none';
//   starsContainer.innerHTML = '';
//     for (let i = 1; i <= 5; i++) {
//       const fillPercentage = Math.max(0, Math.min(100, (average - i + 1) * 100));
//       const star = document.createElement('div');
//       star.className = 'star';
//       star.style.background = `linear-gradient(90deg, #fbd300 ${fillPercentage}%, #DFE1E6 ${fillPercentage}%)`;
//       starsContainer.appendChild(star);
//     }
//     ratingAverage.textContent = average;
//     reviewCountEl.textContent = `Відгуки (${reviews.length})`;

//     reviewsList.innerHTML = '';
//     reviews.forEach(r => {
//       reviewsList.insertAdjacentHTML('beforeend', Mustache.render(reviewTempl, r));
//     });
// }


    const addToCartButton = document.querySelector('.buy-like .lite_btn');

    if (addToCartButton) {
        addToCartButton.addEventListener('click', async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Будь ласка, увійдіть, щоб додати товар до кошика.');
                window.location.href = '/login';
                return;
            }
            const finalProductId = product.id;
            const finalProductPrice = product.current_price;
            const quantity = parseInt(document.querySelector('#product-quantity').textContent, 10);

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
                const response = await fetch('/api/user/cart/add', {
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

  } catch (err) {
    console.error('❌ ПОМИЛКА:', err);
  }
});

// Завантаження фото з папки (імітація — замінити на свій API якщо потрібно)
async function fetchPhotos(folder) {
  // Наприклад, API: GET /api/photos/:folder → [img1.png, img2.png...]
  const res = await fetch(`/api/photos/${folder}`);
  return await res.json();
}

// Взаємозалежність кольору/розміру
function setupVariantDependency(variants) {
  const colorInputs = document.querySelectorAll('input[name="color-item"]');
  const sizeInputs = document.querySelectorAll('input[name="size-item"]');

  colorInputs.forEach(color => {
    color.addEventListener('change', () => {
      const selectedColor = color.value;
      sizeInputs.forEach(size => {
        const match = variants.find(v => v.color_id == selectedColor && v.size_id == size.value);
        size.disabled = !match;
      });
    });
  });

  sizeInputs.forEach(size => {
    size.addEventListener('change', () => {
      const selectedSize = size.value;
      colorInputs.forEach(color => {
        const match = variants.find(v => v.size_id == selectedSize && v.color_id == color.value);
        color.disabled = !match;
      });
    });
  });
}

async function loadTemplate(url) {
  const res = await fetch(url);
  return await res.text();
}

async function markLikedProducts(userId) {
  try {
    const res = await fetch(`/api/user/favorites/${userId}`);
    const favorites = await res.json(); // масив продуктів

    const likedIds = new Set(favorites.map(p => String(p.id)));
    document.querySelectorAll('.like[data-id]').forEach(btn => {
      if (likedIds.has(btn.dataset.id)) {
        btn.classList.add('liked');
      }
    });
  } catch (err) {
    console.error('❌ Не вдалося позначити улюблені:', err);
  }
}

function getUserId() {
  // Поверни ID користувача — з localStorage, cookie або глобальної змінної
  return localStorage.getItem('token');
}