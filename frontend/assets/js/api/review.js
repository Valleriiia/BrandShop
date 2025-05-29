document.addEventListener('DOMContentLoaded', async () => {
    loadReviews();
});


document.getElementById('review-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const rating = document.getElementById('enter-rating').value;
  const comment = document.querySelector('textarea.comment').value;
  const productId = window.location.pathname.split('/').pop();


  if (!rating) {
    alert('Оцініть товар');
    return;
  }

  const token = getToken();
  if (!token) {
  alert('Щоб залишити відгук, увійдіть до акаунта.');
  return;
}

  try {
    const res = await fetch('/api/user/review', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'authorization': `Bearer ${token}`
       },
      body: JSON.stringify({
        product_id: productId,
        rating,
        comment
      })
    });

    if (res.status === 401) {
  alert('Ви повинні бути авторизовані, щоб залишити відгук.');
  return;
}

if (res.status === 409) {
  alert('Ви вже залишили відгук на цей товар.');
  return;
}

    if (!res.ok) throw new Error('Помилка при відправці відгуку');


    // Показати повідомлення
    const msg = document.getElementById('review-message');
    msg.textContent = 'Дякуємо за відгук!';
    msg.style.display = 'block';

    // Очистити форму
    document.getElementById('enter-rating').value = 0;
    document.querySelector('textarea.comment').value = '';
    document.querySelectorAll('.enter-star').forEach(s => s.classList.remove('selected'));

    // Додати до списку
    loadReviews();
  } catch (err) {
    console.error(err);
    alert('Сталася помилка при надсиланні відгуку.');
  }
});

function getToken() {
    return localStorage.getItem('token');
}

async function loadTemplate(url) {
  const res = await fetch(url);
  return await res.text();
}


async function loadReviews() {
    const productId = window.location.pathname.split('/').pop();
    const noReviewsEl = document.getElementById('no-reviews');
    const reviewsList = document.querySelector('.reviews-list ul');
    const reviewCountEl = document.querySelector('h3.reviews-number');
    const starsContainer = document.getElementById('stars-container');
    const ratingAverage = document.querySelector('.rating-average');
    const reviewTempl = await loadTemplate('/assets/js/templates/review-template.mustache');

    const { reviews, average } = await fetch(`/api/reviews/${productId}`).then(r => r.json());


if (reviews.length === 0) {
  noReviewsEl.style.display = 'block';
  reviewsList.innerHTML = '';
  reviewCountEl.textContent = `Відгуки (0)`
} else {
  noReviewsEl.style.display = 'none';
  starsContainer.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const fillPercentage = Math.max(0, Math.min(100, (average - i + 1) * 100));
      const star = document.createElement('div');
      star.className = 'star';
      star.style.background = `linear-gradient(90deg, #fbd300 ${fillPercentage}%, #DFE1E6 ${fillPercentage}%)`;
      starsContainer.appendChild(star);
    }
    ratingAverage.textContent = average;
    reviewCountEl.textContent = `Відгуки (${reviews.length})`;

    reviewsList.innerHTML = '';
    reviews.forEach(r => {
      reviewsList.insertAdjacentHTML('beforeend', Mustache.render(reviewTempl, r));
    });
}
}