document.addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-btn")) {
        let item = event.target.closest(".item");
        item.classList.add("removing");
        setTimeout(() => item.remove(), 300);
    }
});