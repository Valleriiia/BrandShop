document.addEventListener("DOMContentLoaded", function () {
    const filterBtn = document.querySelector(".open-filter");
    const filterSidebar = document.querySelector(".filter-sidebar");
    const closeFilterBtn = document.querySelector(".close-filter-btn");

    filterBtn.addEventListener("click", function () {
        filterSidebar.classList.add("open");
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    });

    closeFilterBtn.addEventListener("click", function () {
        filterSidebar.classList.remove("open");
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.querySelector('.sort-by-toggle');
    const dropdown = document.querySelector('.sort-by-dropdown');
    const optionsList = document.querySelector('.sort-by-options');
    const radioes = optionsList.querySelectorAll('.sort-by-dropdown input[type="radio"]');

    toggleButton.addEventListener('click', function() {
        dropdown.classList.toggle('active');
    });

    radioes.forEach(function(radio) {
        radio.addEventListener('change', function() {
            const selectedOption = Array.from(radioes).find(radioox => radioox.checked);
            if (selectedOption) {
                toggleButton.innerHTML = `${selectedOption.parentNode.textContent} <span class="toggle-icon">+</span>`;
            }
        });
    });
});