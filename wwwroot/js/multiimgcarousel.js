(function () {
    const root = document.getElementById('multiCarousel');
    const viewport = document.getElementById('carouselViewport');
    const track = document.getElementById('carouselTrack');
    const items = Array.from(track.children);
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsWrap = document.getElementById('carouselDots');
    const status = document.getElementById('carouselStatus');

    let totalItems = items.length;

    // responsive breakpoints -> items per view
    // order: [minWidth, items]
    const breakpoints = [
        [0, 1],
        [520, 2],
        [820, 3],
        [1100, 4]
    ];

    let perView = calcPerView();
    let pageCount = Math.max(1, Math.ceil(totalItems / perView));
    let currentPage = 0; // 0..pageCount-1

    // autoplay settings
    const autoplay = true;
    const autoplayDelay = 4000;
    let autoplayTimer = null;
    let isPaused = false;

    // initialize
    function calcPerView() {
        const w = window.innerWidth;
        // find largest breakpoint <= width
        let chosen = 1;
        for (let i = 0; i < breakpoints.length; i++) {
            if (w >= breakpoints[i][0]) chosen = breakpoints[i][1];
        }
        return chosen;
    }

    function setItemWidths() {
        perView = calcPerView();
        // item width includes gaps: we'll set flex-basis so that items per view fit
        const gap = parseFloat(getComputedStyle(track).gap) || 12;
        // width percent per item (approx)
        const percent = (100 / perView);
        items.forEach(it => {
            it.style.flexBasis = `calc(${percent}% - ${(gap * (perView - 1)) / perView}px)`;
        });
        pageCount = Math.max(1, Math.ceil(totalItems / perView));
        // if currentPage out of range after resize, clamp
        if (currentPage > pageCount - 1) currentPage = pageCount - 1;
        buildDots();
        update();
    }

    // navigation
    function goToPage(page, fromUser = false) {
        if (page < 0) page = pageCount - 1;
        if (page >= pageCount) page = 0;
        currentPage = page;
        update();
        if (fromUser) pauseThenResume();
    }

    function nextPage() { goToPage(currentPage + 1); }
    function prevPage() { goToPage(currentPage - 1); }

    function update() {
        // calculate translateX
        // we move by (page * perView) items
        const item = items[0];
        if (!item) return;
        const itemStyle = getComputedStyle(item);
        const itemWidth = item.getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(track).gap) || 12;
        // shift = (itemWidth + gap) * number of items shifted
        const shiftItems = currentPage * perView;
        const shift = (itemWidth + gap) * shiftItems;
        track.style.transform = `translateX(-${shift}px)`;

        // update dots and status
        Array.from(dotsWrap.children).forEach((d, i) => d.setAttribute('aria-pressed', i === currentPage ? 'true' : 'false'));
        status.textContent = `${currentPage + 1} of ${pageCount}`;
        // hide controls if not necessary
        const showControls = totalItems > perView;
        prevBtn.style.display = showControls ? 'flex' : 'none';
        nextBtn.style.display = showControls ? 'flex' : 'none';
    }

    // dots
    function buildDots() {
        dotsWrap.innerHTML = '';
        for (let i = 0; i < pageCount; i++) {
            const btn = document.createElement('button');
            btn.className = 'dot';
            btn.type = 'button';
            btn.setAttribute('aria-label', `Go to page ${i + 1}`);
            btn.setAttribute('aria-pressed', i === currentPage ? 'true' : 'false');
            btn.addEventListener('click', () => goToPage(i, true));
            dotsWrap.appendChild(btn);
        }
    }

    // autoplay
    function startAutoplay() {
        if (!autoplay || totalItems <= perView) return;
        stopAutoplay();
        autoplayTimer = setInterval(() => {
            if (!isPaused) nextPage();
        }, autoplayDelay);
    }
    function stopAutoplay() { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } }
    function pauseThenResume() {
        isPaused = true;
        stopAutoplay();
        setTimeout(() => { isPaused = false; startAutoplay(); }, 3000);
    }

    // pause on hover/focus
    viewport.addEventListener('mouseenter', () => { isPaused = true; });
    viewport.addEventListener('mouseleave', () => { isPaused = false; });
    viewport.addEventListener('focusin', () => { isPaused = true; });
    viewport.addEventListener('focusout', () => { isPaused = false; });

    // keyboard
    viewport.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); nextPage(); pauseThenResume(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); prevPage(); pauseThenResume(); }
    });

    // arrows
    prevBtn.addEventListener('click', () => { prevPage(); pauseThenResume(); });
    nextBtn.addEventListener('click', () => { nextPage(); pauseThenResume(); });

    // touch swipe on viewport
    let touchStartX = 0, touchEndX = 0;
    viewport.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
            if (diff < 0) nextPage(); else prevPage();
            pauseThenResume();
        }
    });

    // update on resize (throttle)
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => setItemWidths(), 120);
    });

    // init all
    setItemWidths();
    startAutoplay();

    // expose methods (optional)
    window._multiCarousel = {
        nextPage, prevPage, goToPage, rebuild: setItemWidths
    };

    // make images accessible (if decorative, set alt=""; else keep meaningful alt)
    // Items can be added/removed dynamically; if you do, update totalItems & call setItemWidths()
    // Example utility if you dynamically add/remove items:
    // function refreshAfterMutation() { totalItems = items.length; setItemWidths(); startAutoplay(); }

})();