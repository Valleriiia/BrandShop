document.querySelectorAll('.like, .shop').forEach(button => {
    button.addEventListener('click', () => {
        button.classList.toggle('active');
    });
});