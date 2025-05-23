document.addEventListener("DOMContentLoaded", function () {
    new Swiper("#swiper2", {
        slidesPerView: "auto", 
        spaceBetween: 24, 
        loop: true,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });
});