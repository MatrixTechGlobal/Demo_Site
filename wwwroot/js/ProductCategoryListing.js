/* ---------------------------------------------------
          INTERACTIVE SORTING (NO HTML CREATION IN JS)
       ----------------------------------------------------*/
(function () {
    const grid = document.getElementById("pl-grid");
    const sortSelect = document.getElementById("pl-sort");

    function getItems() {
        return Array.from(grid.querySelectorAll(".col"));
    }

    function sortItems(mode) {
        const items = getItems();
        let sorted;

        switch (mode) {
            case "price_low":
                sorted = items.sort((a, b) => a.dataset.price - b.dataset.price);
                break;
            case "price_high":
                sorted = items.sort((a, b) => b.dataset.price - a.dataset.price);
                break;
            case "popular":
                sorted = items.sort((a, b) => b.dataset.reviews - a.dataset.reviews);
                break;
            case "alpha":
                sorted = items.sort((a, b) => a.dataset.title.localeCompare(b.dataset.title));
                break;
            default:
                sorted = items.sort((a, b) => a.dataset.order - b.dataset.order);
        }

        const fragment = document.createDocumentFragment();
        sorted.forEach(node => fragment.appendChild(node));
        grid.appendChild(fragment);
    }

    sortSelect.addEventListener("change", e => sortItems(e.target.value));

    /* Add-to-cart click feedback */
    grid.addEventListener("click", e => {
        const btn = e.target.closest(".pl-btn-add");
        if (!btn) return;

        btn.disabled = true;
        const oldText = btn.innerText;
        btn.innerText = "Added!";
        btn.classList.add("opacity-75");

        setTimeout(() => {
            btn.disabled = false;
            btn.innerText = oldText;
            btn.classList.remove("opacity-75");
        }, 900);
    });
})();