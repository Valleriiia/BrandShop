document.querySelectorAll('.enter-star').forEach(star => {
  star.addEventListener('click', () => {
    const value = star.dataset.value;
    document.getElementById('enter-rating').value = value;

    document.querySelectorAll('.enter-star').forEach(s => {
      s.classList.remove('selected');
      if (s.dataset.value <= value) s.classList.add('selected');
    });
  });
  star.addEventListener('mouseover', () => {
    const value = star.dataset.value;

    document.querySelectorAll('.enter-star').forEach(s => {
      s.classList.remove('hover');
      if (s.dataset.value <= value) s.classList.add('hover');
    });
  });
  star.addEventListener('mouseout', () => {

    document.querySelectorAll('.enter-star').forEach(s => {
      s.classList.remove('hover');
    });
  });
});