document.addEventListener('DOMContentLoaded', function () {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');

  searchForm?.addEventListener('submit', function (e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query.length > 0) {
      window.location.href = `/catalog/search?q=${encodeURIComponent(query)}`;
    }
  });
});

document.addEventListener('DOMContentLoaded', async () => {
  const authBlock = document.querySelector('.auth');
  const noAuthBlock = document.querySelector('.no-auth');
  const cartCount = document.querySelector('.cart-count')
  const token = getToken();

  if (token) {
    authBlock.classList.toggle('active');
    noAuthBlock.classList.remove('active');

    try {
      const response = await fetch('/api/user/cart', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      cartCount.textContent = data.cartItems.length;

    } catch (error) {
      console.error('Помилка під час отримання кошика:', error);
      cartItemsContainer.innerHTML = '<p>Не вдалося підключитися до сервера. Спробуйте пізніше.</p>';
    }

  } else {
    authBlock.classList.remove('active');
    noAuthBlock.classList.toggle('active');
    cartCount.textContent = '0';
  }

});

function getToken() {
  return localStorage.getItem('token');
}