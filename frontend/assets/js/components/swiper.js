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
        speed: 1000,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
    });
});