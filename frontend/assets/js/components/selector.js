//selector
document.querySelectorAll(".select-box").forEach((selectBox) => {
    selectBox.addEventListener("click", function (e) {
      e.stopPropagation();
      const dropdown = this.closest(".select-wrapper");
      dropdown.classList.toggle("active");
    });
  });
  
  document.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", function () {
      const selectBox =
        this.closest(".select-wrapper").querySelector(".selected");
      selectBox.textContent = this.textContent;
      selectBox.dataset.value = this.dataset.value;
      this.closest(".select-wrapper").classList.remove("active");
    });
  });
  
  document.addEventListener("click", function (e) {
    const isDropdown = e.target.closest(".select-wrapper");
    if (!isDropdown) {
      document.querySelectorAll(".select-wrapper.active").forEach((dropdown) => {
        dropdown.classList.remove("active");
      });
    }
  });