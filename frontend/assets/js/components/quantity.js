document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".quantity-controls").forEach(control => {
        const minusBtn = control.querySelector(".minus");
        const plusBtn = control.querySelector(".plus");
        const quantitySpan = control.querySelector(".quantity");

        minusBtn.addEventListener("click", function () {
            let currentValue = parseInt(quantitySpan.textContent, 10);
            if (currentValue > 1) {
                quantitySpan.textContent = currentValue - 1;
            }
        });

        plusBtn.addEventListener("click", function () {
            let currentValue = parseInt(quantitySpan.textContent, 10);
            quantitySpan.textContent = currentValue + 1;
        });
    });
});
