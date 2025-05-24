document.addEventListener('DOMContentLoaded', async () => {
  const productList = document.getElementById('product-list');
  const randomSlider = document.getElementById('random-slider');
  const urlParams = new URLSearchParams(window.location.search);

let deptId = null;
let searchQuery = null;
let tmpl = await loadTemplate('/assets/js/templates/product-template.mustache');

if (window.location.pathname.startsWith('/catalog/search')) {
  searchQuery = urlParams.get('q');
  document.getElementById('dept-title').textContent = `Результати пошуку: «${searchQuery}»`;
  document.getElementById('dept-desc').style.display = 'none';
  document.getElementById('dept-img').style.display = 'none';
  loadProducts(false);
} else {
  loadDepartment();
}
  loadRandom();
  loadFiltersFromBackend();
  const userId = getUserId();
if (userId) {
  markLikedProducts(userId);
}

  // Підписуємося на десктопну та мобільну форму
  document.getElementById('filters-content')?.addEventListener('submit', e => {
    e.preventDefault();
    loadProducts(true);
  });
  document.getElementById('filters-mobile')?.addEventListener('submit', e => {
    e.preventDefault();
    loadProducts(true);
  });

  // Підписка на зміну сортування (десктоп)
  document.querySelectorAll('#sort-desktop input[name="sort-item"]').forEach(r => {
    r.addEventListener('change', () => loadProducts(true));
  });
  // мобільне сортування
  document.querySelectorAll('#sort-mobile input[name="sort-item"]').forEach(r => {
    r.addEventListener('change', () => loadProducts(true));
  });

  function getChecked(nameSelectors) {
    // масив селекторів, наприклад ['input[name="category"]', 'input[name="category-side"]']
    return nameSelectors.flatMap(sel =>
      Array.from(document.querySelectorAll(sel + ':checked')).map(i => i.value)
    );
  }

  function loadRandom() {
    fetch('http://localhost:3000/api/products/random?limit=6')
      .then(r => r.json())
      .then(arr => {
        randomSlider.innerHTML = '';
        arr.forEach(p => {
          const html = Mustache.render(tmpl, p);
          const slide = document.createElement('div');
          slide.className = 'swiper-slide';          
          slide.innerHTML = html; // Вставляємо HTML в div
        randomSlider.appendChild(slide);
        });
      })
      .catch(console.error);
  }

  // Отримати й вставити дані кафедри
function loadDepartment() {
  const slug = window.location.pathname.split('/').pop();

  fetch(`http://localhost:3000/api/departments/slug/${slug}`)
    .then(res => res.json())
    .then(dept => {
      deptId = dept.id;

      loadProducts(false);
      document.getElementById('dept-title').textContent = dept.name || '';
      document.getElementById('dept-desc').textContent = dept.description || '';
      if (dept.mascot_photo) {
        document.getElementById('dept-img').src = '/assets/img/' + dept.mascot_photo;
        document.getElementById('dept-img').alt = dept.name;
      }
 // тепер тільки після отримання deptId
    })
    .catch(err => console.error('❌ Кафедра не знайдена:', err));
}


function loadFiltersFromBackend() {
  fetch('http://localhost:3000/api/filters')
    .then(res => res.json())
    .then(data => {
      insertFilterOptions(data.colors, 'color', 'Колір');
      insertFilterOptions(data.colors, 'color-side', 'Колір');

      insertFilterOptions(data.countries, 'country', 'Країна');
      insertFilterOptions(data.countries, 'country-side', 'Країна');

      insertFilterOptions(data.compositions, 'composition', 'Матеріал');
      insertFilterOptions(data.compositions, 'composition-side', 'Матеріал');

      insertFilterOptions(data.categories, 'category', 'Категорія');
      insertFilterOptions(data.categories, 'category-side', 'Категорія');
    })
    .catch(err => console.error('❌ Помилка при завантаженні фільтрів:', err));
}

function insertFilterOptions(items, name, labelText) {
  const selector = `input[name="${name}"]`;
  const parent = document.querySelectorAll(`form.filters-content`);
  parent.forEach(form => {
    const field = form.querySelector(`fieldset:has(${selector})`);
    if (!field) return;

    field.innerHTML = `<legend>${labelText}</legend>`; // очищаємо та вставляємо заголовок

    items.forEach(item => {
      const id = `${name}-${item.id}`;
      const label = document.createElement('label');
      label.className = 'checkbox';
      label.setAttribute('for', id);

      label.innerHTML = `
        <input type="checkbox" name="${name}" id="${id}" value="${item.id}">
        <span class="checkmark">
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 6.75L3 8.75L10.5 0.75" stroke="#54483D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        ${item.color || item.country || item.composition || item.name || '...'}
      `;
      field.appendChild(label);
    });
  });
}

  function loadProducts(apply) {
    const url = searchQuery 
  ? new URL('/api/products/search', window.location.origin)
  : new URL('/api/products', window.location.origin);
    const params = {};

    if (searchQuery) {
    params.search = searchQuery;
  } else if (deptId) {
    params.department_id = deptId;
  }

    if (apply) {
      // категорія
      const cat = getChecked(['input[name="category"]', 'input[name="category-side"]']);
      if (cat.length) params.category_id = cat.join(',');

      // країна
      const ctry = getChecked(['input[name="country"]', 'input[name="country-side"]']);
      if (ctry.length) params.country_id = ctry.join(',');

      // колір
      const clr = getChecked(['input[name="color"]', 'input[name="color-side"]']);
      if (clr.length) params.color_id = clr.join(',');

      // склад
      const comp = getChecked(['input[name="composition"]', 'input[name="composition-side"]']);
      if (comp.length) params.composition_id = comp.join(',');

      // ціна — десктоп + мобільні
      const minD = document.getElementById('min-input')?.value;
      const maxD = document.getElementById('max-input')?.value;
      const minM = document.getElementById('min-input-side')?.value;
      const maxM = document.getElementById('max-input-side')?.value;
      const mn = minD || minM;
      const mx = maxD || maxM;
      if (mn) params.price_min = mn;
      if (mx) params.price_max = mx;

      // сортування — десктоп чи мобільне
      const sd = document.querySelector('#sort-desktop input[name="sort-item"]:checked');
      const sm = document.querySelector('#sort-mobile input[name="sort-item"]:checked');
      const sort = sd?.value || sm?.value;
      if (sort) params.sort = sort;
    }

    // збираємо в URL
    Object.entries(params).forEach(([k,v]) => url.searchParams.append(k, v));

    fetch(url)
      .then(r => r.json())
      .then(list => {
        productList.innerHTML = '';
        list.forEach(p => {
          const html = Mustache.render(tmpl, p);
          productList.insertAdjacentHTML('beforeend', html);
        });
      })
      .catch(console.error);
  }
});

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
  return localStorage.getItem('user_id');
}