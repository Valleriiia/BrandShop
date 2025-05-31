document.addEventListener('DOMContentLoaded', async () => {
  const deptContainer = document.querySelector('.departments-list');
  const discountSwiper = document.querySelector('.discount-swiper .swiper-wrapper');
  const randomSlider = document.getElementById('random-swiper');

  const deptTemplate = await loadTemplate('/assets/js/templates/department-template.mustache');
  const discountTemplate = await loadTemplate('/assets/js/templates/discount-template.mustache');
  const productTemplate = await loadTemplate('/assets/js/templates/product-template.mustache');;

  try {
    // Завантаження кафедр
    const departments = await fetch('/api/departments').then(r => r.json());

    deptContainer.innerHTML = '';
    departments.forEach(d => {
      const html = Mustache.render(deptTemplate, d);
      deptContainer.insertAdjacentHTML('beforeend', html);
    });

    // Завантаження товарів зі знижкою
    const discounts = await fetch('/api/products/discounted').then(r => r.json());

    discountSwiper.innerHTML = '';
    for (const p of discounts) {
      const photoFolder = p.name_of_product_photo;
      const images = await fetch(`/api/photos/${photoFolder}`).then(r => r.json());
      const image = images[0] || 'default.png';
      const html = Mustache.render(discountTemplate, { ...p, image });
      discountSwiper.insertAdjacentHTML('beforeend', html);
    }
    loadRandom();
  } catch (err) {
    console.error('❌ ПОМИЛКА:', err);
  }

  function loadRandom() {
    fetch('http://localhost:3000/api/products/random?limit=10')
      .then(r => r.json())
      .then(arr => {
        randomSlider.innerHTML = '';
        arr.forEach(p => {
          const html = Mustache.render(productTemplate, p);
          const slide = document.createElement('div');
          slide.className = 'swiper-slide';          
          slide.innerHTML = html; // Вставляємо HTML в div
        randomSlider.appendChild(slide);
        });
        window.dispatchEvent(new CustomEvent('productsLoaded'));
      })
      .catch(console.error);
  }
});

async function loadTemplate(url) {
  const res = await fetch(url);
  return await res.text();
}