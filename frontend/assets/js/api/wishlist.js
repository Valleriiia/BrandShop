document.addEventListener('DOMContentLoaded', async () => {
  const token = getToken(); 
  const box = document.querySelector('.wishlist-box');
  const template = await loadTemplate('/assets/js/templates/wishlist-product.mustache');

  try {
    const res = await fetch(`/api/user/favorites`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

    const data = await res.json();
    const products = data.loveItems;
    box.innerHTML = '';

    for (const product of products) {
      const photoFolder = product.name_of_product_photo;
      const photos = await fetch(`/api/photos/${photoFolder}`).then(r => r.json());
      const image = photos[0] || 'default.png'; // на випадок якщо нема фото

      const html = Mustache.render(template, { ...product, image });
      box.insertAdjacentHTML('beforeend', html);
    }
    updateNoItemsVisibility();

  } catch (err) {
    console.error('❌ Не вдалося завантажити улюблені:', err);
    box.innerHTML = '<p>Не вдалося завантажити улюблені товари.</p>';
  }
});

document.querySelector('.wishlist-box').addEventListener('click', async (e) => {
  if (e.target.classList.contains('remove-btn')) {
    e.preventDefault();
    e.stopPropagation();
    const id = e.target.dataset.id;
    const item = e.target.closest('.item');
    const token = getToken(); 

    try {
      const response = await fetch(`/api/user/favorites/remove/${id}`, {
        method: 'DELETE',
        headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
      });
            const errorData = await response.json();
            console.log(errorData.message || 'Помилка при видаленні товару з кошика.');
        

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

async function loadTemplate(url) {
  const res = await fetch(url);
  return await res.text();
}

function getToken() {
  return localStorage.getItem('token');
}

function updateNoItemsVisibility() {
  const items = document.querySelectorAll('.item');
  const noItemsBlock = document.querySelector('.no-items');
  if (noItemsBlock) {
    noItemsBlock.style.display = items.length === 0 ? 'flex' : 'none';
  }
}