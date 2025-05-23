document.addEventListener("DOMContentLoaded", function () {
    new Swiper("#swiper", {
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        loop: false,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
    });
});