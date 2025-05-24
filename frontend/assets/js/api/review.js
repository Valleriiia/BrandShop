document.getElementById('review-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const rating = document.getElementById('enter-rating').value;
  const comment = document.querySelector('textarea.comment').value;
  const productId = window.location.pathname.split('/').pop();

  if (!rating) {
    alert('Оцініть товар');
    return;
  }

  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        rating,
        comment,
        user: 'Анонім' // тимчасово, якщо немає авторизації
      })
    });

    if (!res.ok) throw new Error('Помилка при відправці відгуку');

    const review = await res.json();

    // Показати повідомлення
    const msg = document.getElementById('review-message');
    msg.textContent = 'Дякуємо за відгук!';
    msg.style.display = 'block';

    // Очистити форму
    document.getElementById('enter-rating').value = 0;
    document.querySelector('textarea.comment').value = '';
    document.querySelectorAll('.enter-star').forEach(s => s.classList.remove('selected'));

    // Додати до списку
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? '#407948' : '#ADB9AE');
    }
    review.stars = stars;

    const html = Mustache.render(document.getElementById('review-template').innerHTML, review);
    document.querySelector('.reviews-list ul').insertAdjacentHTML('afterbegin', html);
  } catch (err) {
    console.error(err);
    alert('Сталася помилка при надсиланні відгуку.');
  }
});
