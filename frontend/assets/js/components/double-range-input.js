const minRange = document.getElementById("min-range");
const maxRange = document.getElementById("max-range");
const minInput = document.getElementById("min-input");
const maxInput = document.getElementById("max-input");
const track = document.querySelector(".slider-track");
const rangeMin = 0;
const rangeMax = 2000;

function formatCurrency(value) {
  return `${value} ₴`;
}

function parseCurrency(value) {
  return parseInt(value.replace(/[^\d]/g, "")) || 0;
}

function updateTrack() {
  const min = parseInt(minRange.value);
  const max = parseInt(maxRange.value);
  const percent1 = ((min - rangeMin) / (rangeMax - rangeMin)) * 100;
  const percent2 = ((max - rangeMin) / (rangeMax - rangeMin)) * 100;
  track.style.left = percent1 + "%";
  track.style.width = (percent2 - percent1) + "%";
}

function syncInputsFromSlider() {
  minInput.value = formatCurrency(minRange.value);
  maxInput.value = formatCurrency(maxRange.value);
  updateTrack();
}

function syncSlidersFromInput() {
  let min = parseCurrency(minInput.value);
  let max = parseCurrency(maxInput.value);
  if (min > max) min = max;
  if (max < min) max = min;

  minRange.value = min;
  maxRange.value = max;

  minInput.value = formatCurrency(min);
  maxInput.value = formatCurrency(max);

  updateTrack();
}

minRange.addEventListener("input", () => {
  if (+minRange.value > +maxRange.value) {
    minRange.value = maxRange.value;
  }
  syncInputsFromSlider();
});

maxRange.addEventListener("input", () => {
  if (+maxRange.value < +minRange.value) {
    maxRange.value = minRange.value;
  }
  syncInputsFromSlider();
});

minInput.addEventListener("input", () => {
  if (parseCurrency(minInput.value) > parseCurrency(maxInput.value)) {
    minInput.value = maxInput.value;
  }
  syncSlidersFromInput();
});

maxInput.addEventListener("input", () => {
  if (parseCurrency(maxInput.value) < parseCurrency(minInput.value)) {
    maxInput.value = minInput.value;
  }
  syncSlidersFromInput();
});

updateTrack(); 
syncInputsFromSlider(); 