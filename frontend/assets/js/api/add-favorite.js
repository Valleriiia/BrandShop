document.addEventListener('click', async (e) => {
  const likeBtn = e.target.closest('.like');
  if (!likeBtn) return;

  const productId = likeBtn.dataset.id;
  const userId = getUserId();

  if (!userId) {
    alert('Спочатку увійдіть у свій акаунт.');
    return;
  }

  const isLiked = likeBtn.classList.contains('liked');
  const endpoint = '/api/user/favorites' + (isLiked ? '/remove' : '');

  try {
    const res = await fetch(endpoint, {
      method: isLiked ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, product_id: productId })
    });

    if (res.ok) {
      likeBtn.classList.toggle('liked', !isLiked);
    } else {
      console.error('❌ Сервер не відповів');
    }
  } catch (err) {
    console.error('❌ Помилка запиту:', err);
  }
});