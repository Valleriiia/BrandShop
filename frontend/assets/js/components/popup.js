let popup = document.getElementById("popup");
let popupContent1 = document.getElementById("popup-content1");
let popupContent2 = document.getElementById("popup-content2");

document.getElementById("on-click").addEventListener("click", () => {
    popupContent2.classList.remove("active");
    popupContent2.style.width = "0";
    popupContent1.style.display = "flex";
    popupContent1.classList.add("active");
    popup.classList.add("active");
});

document.querySelectorAll(".close-btn").forEach(button => {
    button.addEventListener("click", () => {
        popup.classList.remove("active");
        popupContent1.classList.remove("active");
        popupContent2.classList.remove("active");
    })
});

popup.addEventListener("click", function (e) {
    if (e.target === this) {
        popup.classList.remove("active")
        popupContent1.classList.remove("active");
        popupContent2.classList.remove("active");
    }
});

document.getElementById("popup-form").addEventListener("submit", function (e) {
    e.preventDefault();
    popupContent1.classList.remove("active");
    setTimeout(() => {
        popupContent1.style.display = "none";
        popupContent2.classList.add("active");
        popupContent2.style.width = "100%";
    } , 300);
});