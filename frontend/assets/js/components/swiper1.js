document.addEventListener('DOMContentLoaded', function () {
    const swiper1 = new Swiper("#swiper1", {
        slidesPerView: "auto", 
        spaceBetween: 24, 
        loop: true,
        speed: 6500,
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
            reverseDirection: true,
        },
    });
    const swiperEl = document.querySelector('#swiper1');

    swiperEl.addEventListener('mouseover', () => {
        swiper1.autoplay.stop(); 
    });

    swiperEl.addEventListener('mouseleave', () => {
        swiper1.autoplay.start(); 
    });
});
