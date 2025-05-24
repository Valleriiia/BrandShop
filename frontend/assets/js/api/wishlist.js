document.addEventListener('DOMContentLoaded', async () => {
  const userId = getUserId(); // ← реалізуй як тобі зручно
  const box = document.querySelector('.wishlist-box');
  const template = await loadTemplate('/assets/js/templates/wishlist-product.mustache');

  try {
    const res = await fetch(`/api/user/favorites/${userId}`);
    const products = await res.json();

    box.innerHTML = '';

    for (const product of products) {
      const photoFolder = product.name_of_product_photo;
      const photos = await fetch(`/api/photos/${photoFolder}`).then(r => r.json());
      const image = photos[0] || 'default.png'; // на випадок якщо нема фото

      const html = Mustache.render(template, { ...product, image });
      box.insertAdjacentHTML('beforeend', html);
    }

    // Обробник видалення
    box.addEventListener('click', async (e) => {
  if (e.target.classList.contains('remove-btn')) {
    const id = e.target.dataset.id;
    const item = e.target.closest('.item');

    try {
      await fetch('/api/user/favorites/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_id: id })
      });

      item.classList.add('removing');
      setTimeout(() => {
        item.remove();
        updateNoItemsVisibility();
      }, 300);
    } catch (err) {
      console.error('❌ Помилка при видаленні з улюблених:', err);
    }
  }
});

  } catch (err) {
    console.error('❌ Не вдалося завантажити улюблені:', err);
    box.innerHTML = '<p>Не вдалося завантажити улюблені товари.</p>';
  }
});

async function loadTemplate(url) {
  const res = await fetch(url);
  return await res.text();
}

function getUserId() {
  // Поверни ID користувача — з localStorage, cookie або глобальної змінної
  return localStorage.getItem('user_id');
}

function updateNoItemsVisibility() {
  const items = document.querySelectorAll('.item');
  const noItemsBlock = document.querySelector('.no-items');
  if (noItemsBlock) {
    noItemsBlock.style.display = items.length === 0 ? 'flex' : 'none';
  }
}