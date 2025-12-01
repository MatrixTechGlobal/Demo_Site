// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
(function () {
    var rootEl = document.querySelector('.hdrx');
    if (!rootEl) { console.warn('hdrx root not found'); return; }

    var searchToggle = rootEl.querySelector('#searchToggle');
    var searchInner = rootEl.querySelector('#searchInner');
    var searchInput = rootEl.querySelector('#searchInput');
    var searchClear = rootEl.querySelector('#searchClear');
    var suggestBox = rootEl.querySelector('#suggestBox');
    var suggestList = rootEl.querySelector('#suggestList');
    var searchTriggerLabel = rootEl.querySelector('#searchTrigger');

    var accountBtn = rootEl.querySelector('#accountBtn');
    var accountCard = rootEl.querySelector('#accountCard');

    console.log('hdrx init — elements found:', {
        root: !!rootEl,
        searchToggle: !!searchToggle,
        searchTrigger: !!searchTriggerLabel,
        searchInput: !!searchInput,
        suggestBox: !!suggestBox,
        accountBtn: !!accountBtn
    });

    var SAMPLES = ["Men's socks", "Women's socks", "Performance socks", "Cozy socks", "Best sellers", "Gifts for him", "Gifts for her", "Socks subscription", "T-shirts", "New arrivals"];

    function filterSuggestions(q) {
        if (!q || q.trim().length === 0) return SAMPLES.slice(0, 6);
        var t = q.trim().toLowerCase(), out = [];
        for (var i = 0; i < SAMPLES.length; i++) { if (SAMPLES[i].toLowerCase().indexOf(t) !== -1) out.push(SAMPLES[i]); if (out.length >= 8) break; }
        return out;
    }

    function populateSuggestions(items) {
        suggestList.innerHTML = '';
        if (!items || items.length === 0) { var li = document.createElement('li'); li.className = 'small'; li.textContent = 'No matches'; suggestList.appendChild(li); return; }
        for (var i = 0; i < items.length; i++) {
            (function (it, idx) {
                var li = document.createElement('li'); li.textContent = it; li.dataset.index = idx; li.tabIndex = -1; li.setAttribute('role', 'option');
                li.addEventListener('click', function () { selectSuggestion(it); });
                li.addEventListener('mouseenter', function () { setActiveIndex(idx); });
                suggestList.appendChild(li);
            })(items[i], i);
        }
    }

    var activeIndex = -1;
    function setActiveIndex(i) { activeIndex = i; updateActive(); }
    function updateActive() {
        var items = suggestList.querySelectorAll('li');
        for (var j = 0; j < items.length; j++) items[j].classList.toggle('active', j === activeIndex);
        var act = suggestList.querySelector('li.active'); if (act) act.scrollIntoView({ block: 'nearest' });
    }

    function positionSuggestBox() {
        if (!searchInner) return;
        var rect = searchInner.getBoundingClientRect();
        suggestBox.style.width = rect.width + 'px';
        suggestBox.style.left = rect.left + 'px';
        suggestBox.style.top = (rect.bottom + 8) + 'px';
    }

    function showSuggestions(items) {
        populateSuggestions(items);
        positionSuggestBox();
        suggestBox.classList.add('show'); suggestBox.setAttribute('aria-hidden', 'false'); activeIndex = -1; updateActive();
    }
    function hideSuggestions() { suggestBox.classList.remove('show'); suggestBox.setAttribute('aria-hidden', 'true'); suggestList.innerHTML = ''; }

    function selectSuggestion(text) { alert('Search for: ' + text); closeSearch(); }

    function openSearchJS() {
        if (searchToggle) searchToggle.checked = true;
        searchInner.classList.add('js-active');
        if (searchTriggerLabel) searchTriggerLabel.setAttribute('aria-pressed', 'true');
        showSuggestions(filterSuggestions(''));
        try { searchInput.focus(); } catch (e) { }
        positionSuggestBox();
        console.log('search opened');
    }
    function closeSearch() {
        if (searchToggle) searchToggle.checked = false;
        searchInner.classList.remove('js-active');
        if (searchTriggerLabel) searchTriggerLabel.setAttribute('aria-pressed', 'false');
        hideSuggestions();
        try { searchInput.value = ''; } catch (e) { }
        console.log('search closed');
    }

    function toggleSearch() {
        try {
            if (searchToggle) {
                var willOpen = !searchToggle.checked;
                searchToggle.checked = willOpen;
                if (willOpen) openSearchJS(); else closeSearch();
            } else {
                if (searchInner && !searchInner.classList.contains('js-active')) openSearchJS(); else closeSearch();
            }
        } catch (err) {
            console.warn('toggleSearch error', err);
            if (searchInner && !searchInner.classList.contains('js-active')) openSearchJS(); else closeSearch();
        }
    }

    // attach extra explicit listeners on the icon (guaranteed)
    if (searchTriggerLabel) {
        // click listener (redundant but robust)
        searchTriggerLabel.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleSearch();
        }, { passive: false });

        // pointerdown for touch devices
        searchTriggerLabel.addEventListener('pointerdown', function (e) {
            // no-op but ensures pointer events are registered early
        }, { passive: true });

        // keyboard
        searchTriggerLabel.setAttribute('tabindex', '0');
        searchTriggerLabel.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleSearch(); } });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function (e) { showSuggestions(filterSuggestions(e.target.value)); });
        searchInput.addEventListener('keydown', function (e) {
            var items = suggestList.querySelectorAll('li');
            if (e.key === 'ArrowDown') { e.preventDefault(); if (items.length) activeIndex = Math.min(activeIndex + 1, items.length - 1); updateActive(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); if (items.length) activeIndex = Math.max(activeIndex - 1, 0); updateActive(); }
            else if (e.key === 'Enter') { e.preventDefault(); if (activeIndex >= 0 && items[activeIndex]) selectSuggestion(items[activeIndex].textContent); else if (searchInput.value && searchInput.value.trim()) { alert('Search: ' + searchInput.value.trim()); closeSearch(); } }
            else if (e.key === 'Escape') { e.preventDefault(); closeSearch(); if (searchTriggerLabel) searchTriggerLabel.focus(); }
        });
    }

    if (searchClear) searchClear.addEventListener('click', function (e) { e.stopPropagation(); if (searchInput.value && searchInput.value.length) { searchInput.value = ''; showSuggestions(filterSuggestions('')); try { searchInput.focus(); } catch (e) { } } else closeSearch(); });

    // robust outside-click detection using rootEl.contains
    document.addEventListener('click', function (e) {
        var t = e.target;
        var clickedInsideRoot = rootEl.contains(t);
        var clickedInsideSearch = false;
        var clickedInsideAccount = false;
        if (clickedInsideRoot) {
            clickedInsideSearch = (searchInner && (searchInner.contains(t) || (suggestBox && suggestBox.contains(t)) || (searchTriggerLabel && searchTriggerLabel.contains(t))));
            clickedInsideAccount = (accountCard && accountCard.contains(t)) || (accountBtn && accountBtn.contains(t));
        }
        if (!clickedInsideSearch) closeSearch();
        if (!clickedInsideAccount) closeAccount();
    });

    window.addEventListener('resize', function () { if (suggestBox.classList.contains('show')) positionSuggestBox(); });
    window.addEventListener('scroll', function () { if (suggestBox.classList.contains('show')) positionSuggestBox(); });

    function openAccount() {
        var rect = accountBtn.getBoundingClientRect();
        var width = 260, pad = 8;
        var left = rect.left + rect.width / 2 - width / 2;
        if (left < pad) left = pad;
        if (left + width > window.innerWidth - pad) left = window.innerWidth - width - pad;
        accountCard.style.left = left + 'px';
        accountCard.style.top = (rect.bottom + 10) + 'px';
        accountCard.classList.add('show'); accountCard.setAttribute('aria-hidden', 'false'); accountBtn.setAttribute('aria-expanded', 'true');
        var prim = accountCard.querySelector('.btn-primary'); if (prim) prim.focus();
    }
    function closeAccount() { accountCard.classList.remove('show'); accountCard.setAttribute('aria-hidden', 'true'); accountBtn.setAttribute('aria-expanded', 'false'); }

    if (accountBtn) accountBtn.addEventListener('click', function (e) { e.stopPropagation(); if (accountCard.classList.contains('show')) closeAccount(); else openAccount(); });

    // expose debug hooks
    rootEl.toggleSearch = toggleSearch;
    window.hdrx = window.hdrx || {}; window.hdrx.toggleSearch = toggleSearch;

    console.log('hdrx ready — click the icon. If not, paste the result of:\n' +
        "document.elementFromPoint(window.innerWidth-40, 40).outerHTML");
})();
(function () {
    const slider = document.querySelector('.info-bar-slider');
    if (!slider) return;

    const viewport = slider.querySelector('.info-viewport');
    const track = slider.querySelector('.info-track');
    const items = Array.from(track.children);
    const prevBtn = slider.querySelector('.info-prev');
    const nextBtn = slider.querySelector('.info-next');

    let index = 0;
    const total = items.length;
    let width = viewport.clientWidth;
    let intervalMs = 3000;
    let timer = null;

    // set width of each item to viewport width (keeps layout consistent)
    function setSizes() {
        width = viewport.clientWidth;
        items.forEach(i => i.style.minWidth = width + 'px');
        // ensure correct translation after resize
        track.style.transform = `translateX(${-index * width}px)`;
    }
    setSizes();
    window.addEventListener('resize', setSizes);

    function show(i) {
        index = ((i % total) + total) % total; // wrap
        track.style.transition = 'transform 420ms cubic-bezier(.2,.8,.2,1)';
        track.style.transform = `translateX(${-index * width}px)`;
    }

    function next() { show(index + 1); }
    function prev() { show(index - 1); }

    // auto-play loop
    function startAuto() { stopAuto(); timer = setInterval(next, intervalMs); }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

    // pause on hover/focus for accessibility
    [slider, viewport, prevBtn, nextBtn].forEach(el => {
        el.addEventListener('mouseenter', stopAuto);
        el.addEventListener('mouseleave', startAuto);
        el.addEventListener('focusin', stopAuto);
        el.addEventListener('focusout', startAuto);
    });

    // arrow handlers
    prevBtn.addEventListener('click', () => { prev(); });
    nextBtn.addEventListener('click', () => { next(); });

    // keyboard support: left/right when viewport focused
    viewport.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });

    // initial start
    startAuto();

    // expose for debugging (optional)
    slider._infoSlider = { show, next, prev, startAuto, stopAuto };

})();