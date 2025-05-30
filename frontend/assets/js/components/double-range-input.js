const minRange = document.getElementById("min-range");
const maxRange = document.getElementById("max-range");
const minInput = document.getElementById("min-input");
const maxInput = document.getElementById("max-input");
const track = document.querySelector(".slider-track-main");

const minRangeSide = document.getElementById("min-range-side");
const maxRangeSide = document.getElementById("max-range-side");
const minInputSide = document.getElementById("min-input-side");
const maxInputSide = document.getElementById("max-input-side");
const trackSide = document.querySelector(".slider-track-side");

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

function updateTrackSide() {
  if (!trackSide) return;
  const min = parseInt(minRangeSide.value);
  const max = parseInt(maxRangeSide.value);
  const percent1 = ((min - rangeMin) / (rangeMax - rangeMin)) * 100;
  const percent2 = ((max - rangeMin) / (rangeMax - rangeMin)) * 100;
  trackSide.style.left = percent1 + "%";
  trackSide.style.width = (percent2 - percent1) + "%";
}

function syncInputsFromSlider() {
  minInput.value = formatCurrency(minRange.value);
  maxInput.value = formatCurrency(maxRange.value);
  updateTrack();
}

function syncInputsFromSliderSide() {
  minInputSide.value = formatCurrency(minRangeSide.value);
  maxInputSide.value = formatCurrency(maxRangeSide.value);
  updateTrackSide();
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

function syncSlidersFromInputSide() {
  let min = parseCurrency(minInputSide.value);
  let max = parseCurrency(maxInputSide.value);
  if (min > max) min = max;
  if (max < min) max = min;

  minRangeSide.value = min;
  maxRangeSide.value = max;

  minInputSide.value = formatCurrency(min);
  maxInputSide.value = formatCurrency(max);

  updateTrackSide();
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

minRangeSide.addEventListener("input", () => {
  if (+minRangeSide.value > +maxRangeSide.value) {
    minRangeSide.value = maxRangeSide.value;
  }
  syncInputsFromSliderSide();
});

maxRangeSide.addEventListener("input", () => {
  if (+maxRangeSide.value < +minRangeSide.value) {
    maxRangeSide.value = minRangeSide.value;
  }
  syncInputsFromSliderSide();
});

minInputSide.addEventListener("input", () => {
  if (parseCurrency(minInputSide.value) > parseCurrency(maxInputSide.value)) {
    minInputSide.value = maxInputSide.value;
  }
  syncSlidersFromInputSide();
});

maxInputSide.addEventListener("input", () => {
  if (parseCurrency(maxInputSide.value) < parseCurrency(minInputSide.value)) {
    maxInputSide.value = minInputSide.value;
  }
  syncSlidersFromInputSide();
});

updateTrack(); 
syncInputsFromSlider(); 

updateTrackSide(); 
syncInputsFromSliderSide(); 