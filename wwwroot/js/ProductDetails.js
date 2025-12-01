(function () {
    const root = document.querySelector('.pdp-root');

    // Thumbnails -> swap main image & active thumbnail
    const thumbs = root.querySelectorAll('.pdp-thumb');
    const mainImg = root.querySelector('#pdp-main-img');

    thumbs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const src = btn.dataset.large;
            if (src) {
                mainImg.src = src;
                // active state
                thumbs.forEach(t => t.classList.remove('pdp-thumb--active'));
                btn.classList.add('pdp-thumb--active');
            }
        });
        // keyboard accessibility
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
        });
    });

    // Swatches -> swap main image & active swatch
    const swatches = root.querySelectorAll('.pdp-swatch');
    swatches.forEach(sw => {
        sw.addEventListener('click', () => {
            const src = sw.dataset.large;
            if (src) mainImg.src = src;
            swatches.forEach(s => s.classList.remove('pdp-swatch--active'));
            sw.classList.add('pdp-swatch--active');

            // sync thumbnail active if any thumb matches that large-src
            thumbs.forEach(t => {
                if (t.dataset.large === sw.dataset.large) { thumbs.forEach(x => x.classList.remove('pdp-thumb--active')); t.classList.add('pdp-thumb--active'); }
            });
        });
        sw.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sw.click(); } });
    });

    // Size selection: single-select toggle
    const sizes = root.querySelectorAll('.pdp-size');
    sizes.forEach(sz => {
        sz.addEventListener('click', () => {
            sizes.forEach(s => { s.classList.remove('pdp-size--selected'); s.setAttribute('aria-pressed', 'false'); });
            sz.classList.add('pdp-size--selected');
            sz.setAttribute('aria-pressed', 'true');
        });
        sz.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sz.click(); } });
    });

    // Add to bag: temporary feedback + dispatch custom event with product details
    const addBtn = root.querySelector('#pdp-add');
    addBtn.addEventListener('click', () => {
        addBtn.disabled = true;
        const old = addBtn.textContent;
        addBtn.textContent = 'Added ✓';

        // gather minimal payload (could be extended)
        const selectedSize = root.querySelector('.pdp-size--selected')?.dataset?.size || null;
        const selectedSwatch = root.querySelector('.pdp-swatch--active')?.dataset?.large || null;
        const payload = {
            title: root.querySelector('.pdp-title')?.textContent?.trim(),
            price: root.querySelector('.pdp-price')?.textContent?.trim(),
            size: selectedSize,
            variantImage: selectedSwatch,
            timestamp: Date.now()
        };

        // dispatch event so host app can listen and pick it up
        root.dispatchEvent(new CustomEvent('pdp:add-to-cart', { detail: payload }));

        setTimeout(() => {
            addBtn.disabled = false;
            addBtn.textContent = old;
        }, 900);
    });

    // Favorite toggle
    const favBtn = root.querySelector('#pdp-fav');
    favBtn.addEventListener('click', () => {
        const is = favBtn.classList.toggle('pdp-fav--active');
        favBtn.setAttribute('aria-pressed', String(is));
        // update heart char
        const heart = favBtn.querySelector('.pdp-heart');
        heart.textContent = is ? '♥' : '♡';
        // Dispatch event for host app
        root.dispatchEvent(new CustomEvent('pdp:favorite', { detail: { favorited: is, title: root.querySelector('.pdp-title')?.textContent?.trim() } }));
    });

    // optional: allow left/right arrow to navigate thumbs when focused inside thumbs row
    const thumbsContainer = root.querySelector('#pdp-thumbs');
    thumbsContainer.addEventListener('keydown', (e) => {
        const focusable = Array.from(thumbs);
        const idx = focusable.indexOf(document.activeElement);
        if (e.key === 'ArrowRight' && idx >= 0 && idx < focusable.length - 1) { focusable[idx + 1].focus(); e.preventDefault(); }
        if (e.key === 'ArrowLeft' && idx > 0) { focusable[idx - 1].focus(); e.preventDefault(); }
    });

})();