document.addEventListener('DOMContentLoaded', async () => {
  const productList = document.getElementById('product-list');
  const randomSlider = document.getElementById('random-slider');
  const urlParams = new URLSearchParams(window.location.search);

  let deptId = null;
  let searchQuery = null;
  const template = await loadTemplate('/assets/js/templates/product-template.mustache');

  // === Ініціалізація сторінки ===
  if (window.location.pathname.startsWith('/catalog/search')) {
    searchQuery = urlParams.get('q');
    document.getElementById('dept-title').textContent = `Результати пошуку: «${searchQuery}»`;
    document.getElementById('dept-desc').style.display = 'none';
    document.getElementById('dept-img').style.display = 'none';
    loadProducts({ applyFilters: false });
  } else {
    loadDepartment();
  }

  loadRandom();
  loadFilters();

  // === Обробники подій ===
  ['filters-content', 'filters-mobile'].forEach(id => {
    document.getElementById(id)?.addEventListener('submit', e => {
      e.preventDefault();
      loadProducts({ applyFilters: true });
    });
  });

  ['#sort-desktop', '#sort-mobile'].forEach(id => {
    document.querySelectorAll(`${id} input[name="sort-item"]`)
      .forEach(r => r.addEventListener('change', () => loadProducts({ applyFilters: true })));
  });

  // === Основні функції ===

  async function loadTemplate(url) {
    const res = await fetch(url);
    return await res.text();
  }

  function loadRandom() {
    fetch('http://localhost:3000/api/products/random?limit=6')
      .then(res => res.json())
      .then(products => {
        randomSlider.innerHTML = '';
        products.forEach(p => {
          const html = Mustache.render(template, p);
          const slide = document.createElement('div');
          slide.className = 'swiper-slide';
          slide.innerHTML = html;
          randomSlider.appendChild(slide);
        });
        window.dispatchEvent(new CustomEvent('productsLoaded'));
      })
      .catch(console.error);
  }

  function loadDepartment() {
    const slug = window.location.pathname.split('/').pop();

    fetch(`http://localhost:3000/api/departments/slug/${slug}`)
      .then(res => res.json())
      .then(dept => {
        deptId = dept.id;
        loadProducts({ applyFilters: false });

        document.getElementById('dept-title').textContent = dept.name || '';
        document.getElementById('dept-desc').textContent = dept.description || '';
        if (dept.mascot_photo) {
          const img = document.getElementById('dept-img');
          img.src = `/assets/img/${dept.mascot_photo}`;
          img.alt = dept.name;
        }
      })
      .catch(err => console.error('❌ Кафедра не знайдена:', err));
  }

  function loadFilters() {
    fetch('http://localhost:3000/api/filters')
      .then(res => res.json())
      .then(data => {
        const filters = [
          { items: data.colors, name: 'color', label: 'Колір' },
          { items: data.countries, name: 'country', label: 'Країна' },
          { items: data.compositions, name: 'composition', label: 'Матеріал' },
          { items: data.categories, name: 'category', label: 'Категорія' },
        ];
        filters.forEach(f => {
          insertFilterOptions(f.items, f.name, f.label);
          insertFilterOptions(f.items, `${f.name}-side`, f.label);
        });
      })
      .catch(err => console.error('❌ Помилка при завантаженні фільтрів:', err));
  }

  function insertFilterOptions(items, name, label) {
    const selector = `input[name="${name}"]`;
    document.querySelectorAll(`form.filters-content`).forEach(form => {
      const field = form.querySelector(`fieldset:has(${selector})`);
      if (!field) return;

      field.innerHTML = `<legend>${label}</legend>`;
      items.forEach(item => {
        const id = `${name}-${item.id}`;
        const value = item.color || item.country || item.composition || item.name || '...';

        const labelEl = document.createElement('label');
        labelEl.className = 'checkbox';
        labelEl.setAttribute('for', id);
        labelEl.innerHTML = `
          <input type="checkbox" name="${name}" id="${id}" value="${item.id}">
          <span class="checkmark">
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 6.75L3 8.75L10.5 0.75" stroke="#54483D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          ${value}
        `;
        field.appendChild(labelEl);
      });
    });
  }

  function getChecked(selectors) {
    return selectors.flatMap(sel =>
      Array.from(document.querySelectorAll(`${sel}:checked`)).map(i => i.value)
    );
  }

  function loadProducts({ applyFilters }) {
    const isSearch = !!searchQuery;
    const url = new URL(isSearch ? '/api/products/search' : '/api/products', window.location.origin);
    const params = isSearch ? { search: searchQuery } : deptId ? { department_id: deptId } : {};

    if (applyFilters) {
      const filterFields = ['category', 'country', 'color', 'composition'];
      filterFields.forEach(name => {
        const values = getChecked([`input[name="${name}"]`, `input[name="${name}-side"]`]);
        if (values.length) params[`${name}_id`] = values.join(',');
      });

      const priceMin = document.getElementById('min-input')?.value || document.getElementById('min-input-side')?.value;
      const priceMax = document.getElementById('max-input')?.value || document.getElementById('max-input-side')?.value;
      if (priceMin) params.price_min = priceMin;
      if (priceMax) params.price_max = priceMax;

      const sort = document.querySelector('#sort-desktop input[name="sort-item"]:checked')?.value ||
                   document.querySelector('#sort-mobile input[name="sort-item"]:checked')?.value;
      if (sort) params.sort = sort;
    }

    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

    fetch(url)
      .then(res => res.json())
      .then(products => {
        productList.innerHTML = '';
        products.forEach(p => {
          const html = Mustache.render(template, p);
          productList.insertAdjacentHTML('beforeend', html);
        });
        window.dispatchEvent(new CustomEvent('productsLoaded'));
      })
      .catch(console.error);
  }
});
