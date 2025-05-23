document.addEventListener('DOMContentLoaded', function () {
    new Swiper('#swiper3', {
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        loop: false,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });

});
