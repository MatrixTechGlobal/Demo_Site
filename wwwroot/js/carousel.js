(function () {
    const carouselEl = document.getElementById('heroCarousel');
    const viewport = document.getElementById('carouselViewport');
    const slides = Array.from(carouselEl.querySelectorAll('.hero-slide'));
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('carouselDots');
    const status = document.getElementById('carouselStatus');

    let current = 0;
    const total = slides.length;
    const autoplay = true;         // toggle autoplay
    const intervalMs = 5000;      // autoplay interval
    let timer = null;
    let isPaused = false;

    // build dots
    slides.forEach((s, i) => {
        const btn = document.createElement('button');
        btn.className = 'dot';
        btn.type = 'button';
        btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
        btn.setAttribute('data-index', String(i));
        btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
        btn.addEventListener('click', () => goTo(i, true));
        dotsContainer.appendChild(btn);
    });

    const dots = Array.from(dotsContainer.children);

    function updateUI() {
        slides.forEach((s, i) => {
            s.classList.toggle('is-active', i === current);
            s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
            s.setAttribute('tabindex', i === current ? '0' : '-1');
        });
        dots.forEach((d, i) => d.setAttribute('aria-pressed', i === current ? 'true' : 'false'));
        status.textContent = `Slide ${current + 1} of ${total}`;
    }

    function goTo(index, userTriggered = false) {
        if (index < 0) index = total - 1;
        if (index >= total) index = 0;
        current = index;
        updateUI();
        if (autoplay && !userTriggered) restartTimer();
        if (userTriggered) pauseThenResume();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // autoplay timer
    function startTimer() {
        if (!autoplay) return;
        clearTimer();
        timer = setInterval(() => {
            if (!isPaused) next();
        }, intervalMs);
    }
    function clearTimer() { if (timer) { clearInterval(timer); timer = null; } }
    function restartTimer() { clearTimer(); startTimer(); }

    // pause on hover/focus
    viewport.addEventListener('mouseenter', () => { isPaused = true; });
    viewport.addEventListener('mouseleave', () => { isPaused = false; });
    viewport.addEventListener('focusin', () => { isPaused = true; });
    viewport.addEventListener('focusout', () => { isPaused = false; });

    // pause briefly after manual interaction for better UX
    function pauseThenResume() {
        isPaused = true;
        clearTimer();
        setTimeout(() => { isPaused = false; startTimer(); }, 3500);
    }

    // keyboard
    viewport.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });

    // arrows
    prevBtn.addEventListener('click', () => { prev(); pauseThenResume(); });
    nextBtn.addEventListener('click', () => { next(); pauseThenResume(); });

    // touch swipe (basic)
    let touchStartX = 0;
    let touchEndX = 0;
    viewport.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
            if (diff < 0) next(); else prev();
            pauseThenResume();
        }
    });

    // initial UI
    updateUI();
    startTimer();

    // expose for debugging (optional)
    window._heroCarousel = { goTo, next, prev, restartTimer };

    // make images decorative for screen readers (we use headings/text for content)
    carouselEl.querySelectorAll('img.bg').forEach(img => img.setAttribute('alt', ''));

})();