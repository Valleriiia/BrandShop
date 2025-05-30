document.addEventListener('DOMContentLoaded', async () => {
  const productId = window.location.pathname.split('/').pop();
  const elements = {
    mainImg: document.getElementById('mainImg'),
    thumbnails: document.querySelector('.thumbnails'),
    swiperWrapper: document.querySelector('#swiper4 .swiper-wrapper'),
    breadLink: document.querySelector('.breadcrambs a[href^="/catalog"]'),
    breadText: document.querySelector('.breadcrambs a[href="#"]'),
    cross: document.querySelector('.product-price .cross'),
    currentPrice: document.querySelector('.product-price .current-price'),
    discountEl: document.querySelector('.product-price .discount'),
    desc: document.querySelector('.product-desc .description'),
    colorsContainer: document.querySelector('.colors-container'),
    sizesContainer: document.querySelector('.sizes-container'),
    charContainer: document.querySelector('.product-charact'),
    recomendWrapper: document.getElementById('random-swiper'),
    likeBtn: document.querySelector('.buy-like .like'),
    addToCartButton: document.querySelector('.buy-like .lite_btn'),
  };

  const productTmpl = await loadTemplate('/assets/js/templates/product-template.mustache');

  try {
    const res = await fetch(`/api/products/${productId}`);
    const { product, attributes, similar } = await res.json();

    // 🥖 Хлібні крихти
    elements.breadLink.href = `/catalog/${product.department_slug}`;
    elements.breadLink.textContent = product.department_name;
    elements.breadText.textContent = product.name;

    // 🖼 Фото товару
    const photoFolder = product.name_of_product_photo;
    const photoPath = `/assets/img/${photoFolder}`;
    const images = await fetchPhotos(photoFolder);

    if (images.length > 0) {
      elements.mainImg.src = `${photoPath}/${images[0]}`;
    }

    elements.thumbnails.innerHTML = '';
    elements.swiperWrapper.innerHTML = '';
    images.forEach((img, i) => {
      elements.thumbnails.insertAdjacentHTML('beforeend', `
        <img src="${photoPath}/${img}" alt="thumb${i}" onclick="changeImage('${photoPath}/${img}')">
      `);
      elements.swiperWrapper.insertAdjacentHTML('beforeend', `
        <div class="swiper-slide"><img src="${photoPath}/${img}" alt="Фото ${i}"></div>
      `);
    });

    // 💸 Ціни та знижки
    if (product.discount > 0) {
      elements.cross.textContent = `${product.price}₴`;
      elements.currentPrice.textContent = `${product.current_price}₴`;
      elements.discountEl.textContent = `-${product.discount}%`;
    } else {
      elements.cross.style.display = 'none';
      elements.discountEl.style.display = 'none';
      elements.currentPrice.textContent = `${product.price}₴`;
    }

    elements.likeBtn.dataset.id = productId;

    // 📝 Опис
    elements.desc.textContent = product.description || 'Немає опису';

    // 🎨 Кольори і розміри
    renderOptions(attributes, elements.colorsContainer, 'color');
    renderOptions(attributes, elements.sizesContainer, 'size');
    setupVariantDependency(attributes);

    // 🧾 Характеристики
    elements.charContainer.innerHTML = `
      <h3>Характеристика</h3>
      <p>Матеріал: ${product.composition}</p>
      <p>Виробник: ${product.country}</p>
    `;

    // 🔁 Схожі товари
    elements.recomendWrapper.innerHTML = '';
    similar.forEach(p => {
      const html = Mustache.render(productTmpl, p);
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.innerHTML = html;
      elements.recomendWrapper.appendChild(slide);
    });

    // ❤️ Улюблені
    const token = getToken();
    if (token) {
      markLikedProducts(token);
    }

    // 🛒 Додавання до кошика
    if (elements.addToCartButton) {
  elements.addToCartButton.addEventListener('click', async () => {
    const token = getToken();
    if (!token) {
      alert('Будь ласка, увійдіть, щоб додати товар до кошика.');
      return window.location.href = '/login';
    }

    const selectedColor = document.querySelector('input[name="color-item"]:checked');
    const selectedSize = document.querySelector('input[name="size-item"]:checked');
    const quantity = parseInt(document.querySelector('#product-quantity')?.textContent || '1', 10);

    if (!selectedColor || !selectedSize) {
      alert('Оберіть колір і розмір товару перед додаванням у кошик.');
      return;
    }

    const colorId = selectedColor.value;
    const sizeId = selectedSize.value;

    // Знайти відповідний attribute.id
    const matchedAttr = attributes.find(attr =>
      String(attr.color_id) === colorId && String(attr.size_id) === sizeId
    );

    if (!matchedAttr) {
      alert('Обрана комбінація колір + розмір недоступна.');
      return;
    }

    if (!matchedAttr.id || isNaN(quantity) || quantity <= 0) {
      alert('Некоректні дані для замовлення.');
      return;
    }

    const data = {
      productId: product.id,
      attributeId: matchedAttr.id,
      quantity,
      price: product.current_price 
    };

    try {
      const response = await fetch('/api/user/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      alert(result.message || (response.ok
        ? 'Товар додано до кошика!'
        : 'Помилка при додаванні товару.'));
    } catch (err) {
      console.error('❌ Помилка з\'єднання з сервером:', err);
      alert('Сервер недоступний. Спробуйте пізніше.');
    }
  });
}


  } catch (err) {
    console.error('❌ Помилка завантаження товару:', err);
  }
});

// Рендер кольорів або розмірів
function renderOptions(attributes, container, type) {
  const map = new Map();
  const idKey = `${type}_id`;
  const nameKey = type;

  attributes.forEach(attr => {
    if (!map.has(attr[idKey])) {
      map.set(attr[idKey], attr[nameKey]);
    }
  });

  container.innerHTML = '';
  map.forEach((label, id) => {
    container.insertAdjacentHTML('beforeend', `
      <li>
        <label class="checkbox" for="${type}-${id}">
          <input type="radio" name="${type}-item" id="${type}-${id}" value="${id}">
          ${label}
        </label>
      </li>
    `);
  });
}

// Залежність кольорів і розмірів
function setupVariantDependency(variants) {
  const colors = document.querySelectorAll('input[name="color-item"]');
  const sizes = document.querySelectorAll('input[name="size-item"]');

  colors.forEach(color => {
    color.addEventListener('change', () => {
      sizes.forEach(size => {
        size.disabled = !variants.some(v =>
          v.color_id == color.value && v.size_id == size.value
        );
      });
    });
  });

  sizes.forEach(size => {
    size.addEventListener('change', () => {
      colors.forEach(color => {
        color.disabled = !variants.some(v =>
          v.size_id == size.value && v.color_id == color.value
        );
      });
    });
  });
}

async function fetchPhotos(folder) {
  const res = await fetch(`/api/photos/${folder}`);
  return await res.json();
}

async function loadTemplate(url) {
  const res = await fetch(url);
  return await res.text();
}

async function markLikedProducts(token) {
  try {
    const res = await fetch('/api/user/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const { loveItems } = await res.json();
    const likedIds = new Set(loveItems.map(p => String(p.id)));

    document.querySelectorAll('.like[data-id]').forEach(btn => {
      if (likedIds.has(btn.dataset.id)) {
        btn.classList.add('active');
      }
    });
  } catch (err) {
    console.error('❌ Не вдалося позначити улюблені:', err);
  }
}

function getToken() {
  return localStorage.getItem('token');
}
