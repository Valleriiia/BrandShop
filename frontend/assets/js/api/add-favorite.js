document.addEventListener('click', async (e) => {
  const likeBtn = e.target.closest('.like');
  if (!likeBtn) return;
  e.preventDefault();
  e.stopPropagation();

  const productId = likeBtn.dataset.id;
  const token = getToken();

  if (!token) {
    alert('Спочатку увійдіть у свій акаунт.');
    return;
  }

  const isLiked = likeBtn.classList.contains('active');
  const endpoint = '/api/user/favorites' + (isLiked ? `/remove/${productId}` : '/add');

  try {
    const res = await fetch(endpoint, {
      method: isLiked ? 'DELETE' : 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'authorization': `Bearer ${token}`
       },
      body: JSON.stringify({product_id: productId })
    });

    if (res.ok) {
      likeBtn.classList.toggle('active', !isLiked);
    } else {
      console.error('❌ Сервер не відповів');
    }
  } catch (err) {
    console.error('❌ Помилка запиту:', err);
  }
});

function getToken() {
    return localStorage.getItem('token');
}