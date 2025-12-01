(function () {
    // create toggle button in header
    function createNavToggle() {
        const header = document.querySelector('.storedash-header');
        if (!header) return;
        if (document.querySelector('.nav-toggle')) return;
        const btn = document.createElement('button');
        btn.className = 'nav-toggle';
        btn.innerHTML = '☰ Menu';
        btn.setAttribute('aria-expanded', 'false');
        btn.addEventListener('click', function () {
            const nav = document.querySelector('.storedash-nav');
            const backdrop = document.querySelector('.nav-backdrop') || createBackdrop();
            const isHidden = nav.classList.contains('mobile-hidden');
            if (isHidden) {
                nav.classList.remove('mobile-hidden');
                backdrop.classList.add('show');
                document.body.classList.add('nav-open');
                btn.setAttribute('aria-expanded', 'true');
            } else {
                nav.classList.add('mobile-hidden');
                backdrop.classList.remove('show');
                document.body.classList.remove('nav-open');
                btn.setAttribute('aria-expanded', 'false');
            }
        });
        header.insertBefore(btn, header.firstChild);
    }

    function createBackdrop() {
        const b = document.createElement('div');
        b.className = 'nav-backdrop';
        b.addEventListener('click', function () {
            const nav = document.querySelector('.storedash-nav');
            if (nav) nav.classList.add('mobile-hidden');
            b.classList.remove('show');
            document.body.classList.remove('nav-open');
            const btn = document.querySelector('.nav-toggle'); if (btn) btn.setAttribute('aria-expanded', 'false');
        });
        const app = document.querySelector('.storedash-app');
        app.appendChild(b);
        return b;
    }

    // initially hide nav on small screens
    function initNavState() {
        const nav = document.querySelector('.storedash-nav');
        if (window.innerWidth <= 1000 && nav) {
            nav.classList.add('mobile-hidden');
        } else if (nav) {
            nav.classList.remove('mobile-hidden');
        }
    }

    // debounce helper
    function debounce(fn, delay) {
        let t; return function () { clearTimeout(t); t = setTimeout(() => fn.apply(this, arguments), delay); };
    }

    // refresh Chart.js canvases by destroying and re-creating with current data
    function refreshCharts() {
        try {
            if (typeof window.DUMMY_DATA === 'undefined') return;
            const series = window.DUMMY_DATA.traffic.series || [];
            if (typeof createSalesMiniChart === 'function') createSalesMiniChart('chart-sales-mini', series);
            if (typeof createTrafficChart === 'function') createTrafficChart('chart-traffic', series);
        } catch (e) { console.warn('refreshCharts error', e); }
    }

    const r = debounce(function () { refreshCharts(); }, 200);
    window.addEventListener('resize', r);
    window.addEventListener('orientationchange', r);

    // initialize
    document.addEventListener('DOMContentLoaded', function () { createNavToggle(); initNavState(); refreshCharts(); });
})();

/* Dummy data — replace with API data */
window.DUMMY_DATA = {
    meta: { sales: 45720, orders: 72, aov: 635, cr: 2.8 },
    live: { visitors: 18, carts: 5, events: [{ t: 'Order placed', info: 'Order #5781 — ₹2,350' }, { t: 'New signup', info: 'guest@example.com' }, { t: 'Abandoned cart', info: 'Cart with 3 items' }] },
    orders: [{ id: 5781, name: 'Kaffe Mug — Blue', status: 'processing', amount: 2350, flag: '' }, { id: 5780, name: 'Leather Wallet', status: 'awaiting_payment', amount: 1299, flag: 'payment' }, { id: 5779, name: 'Bean Bag', status: 'shipped', amount: 3600, flag: '' }],
    traffic: { source: 'Organic Search', sessions: 840, campaign: 'Summer Promo', series: [5, 9, 12, 8, 15, 20, 18, 16, 22, 20, 24, 28] },
    customers: { new: 12, returningRate: 27, highValue: 3 },
    lowstock: [{ sku: 'KB-123', name: 'Kaffe Mug — Blue', qty: 4 }, { sku: 'LW-22', name: 'Leather Wallet', qty: 2 }],
    attention: { verifications: 2 }
};

/* Micro-copy / tooltips mapping (used for aria descriptions and visible tooltips) */
const MICRO_COPY = {
    'm-sales': 'Total gross sales for the current day. Includes completed transactions and excludes refunds.',
    'm-orders': 'Number of orders placed today across all sales channels. Click a tile to view details.',
    'm-aov': 'Average order value calculated as total sales divided by number of orders.',
    'm-cr': 'Conversion rate: percentage of visitors that completed an order today.',
    'live-visitors': 'Current number of visitors browsing your store.',
    'live-carts': 'Number of carts with at least one item added.',
    'orders-list': 'List of recent orders. Click an order to open details in the full app.',
    'top-source': 'Traffic source driving the most sessions in the last 24 hours.',
    'sessions': 'Total sessions (visits) in the last 24 hours.',
    'top-campaign': 'Campaign with the most attributed sessions.',
    'lowstock-list': 'Products that have low stock and may need replenishment.',
    'attention-area': 'Items and issues that require manual review by the store admin.'
};

/* helpers */
const fmtCurr = v => '₹' + (v).toLocaleString('en-IN');
const pct = v => (v).toFixed(1) + '%';

/* Chart refs */
let salesMiniChart = null;
let trafficChart = null;

/* render */
function renderAll(data) {
    // metrics
    document.getElementById('m-sales').textContent = fmtCurr(data.meta.sales);
    document.getElementById('m-orders').textContent = data.meta.orders;
    document.getElementById('m-aov').textContent = fmtCurr(data.meta.aov);
    document.getElementById('m-cr').textContent = pct(data.meta.cr);

    // Update accessible descriptions (aria-labels and title)
    Object.keys(MICRO_COPY).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute('title', MICRO_COPY[id]);
            // also set aria-describedby to a short id if needed (we added sr-only blocks for cards earlier)
        }
    });

    // trends - demo
    document.getElementById('t-sales').innerHTML = '<span class="storedash-trend-up">+3.4%</span> vs yesterday';
    document.getElementById('t-orders').innerHTML = '<span class="storedash-trend-up">+' + (Math.round(Math.random() * 5)) + '</span> new';

    // live
    document.getElementById('live-visitors').textContent = data.live.visitors;
    document.getElementById('live-carts').textContent = data.live.carts;
    const lf = document.getElementById('live-feed');
    lf.innerHTML = '';
    data.live.events.forEach(e => {
        const div = document.createElement('div');
        div.className = 'storedash-event';
        div.innerHTML = `<div style="font-weight:600">${e.t}</div><div class="muted">${e.info}</div>`;
        lf.appendChild(div);
    });

    // orders
    const ol = document.getElementById('orders-list');
    ol.innerHTML = '';
    window.DUMMY_DATA.orders.forEach(function (o) {
        const row = document.createElement('div');
        row.style = 'display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f0f2f5';

        const left = document.createElement('div');
        const title = document.createElement('div');
        title.style.fontWeight = '700';
        title.textContent = `#${o.id} — ${o.name}`;
        const status = document.createElement('div');
        status.className = 'muted';
        status.textContent = (o.status || '').replace('_', ' ');
        left.appendChild(title);
        left.appendChild(status);

        const right = document.createElement('div');
        right.style.textAlign = 'right';
        const amt = document.createElement('div');
        amt.style.fontWeight = '800';
        amt.textContent = fmtCurr(o.amount);
        right.appendChild(amt);
        if (o.flag) {
            const flagEl = document.createElement('div');
            flagEl.className = 'muted';
            flagEl.style.fontSize = '12px';
            flagEl.style.marginTop = '6px';
            flagEl.style.color = 'var(--sd-danger)';
            flagEl.textContent = o.flag;
            right.appendChild(flagEl);
        }

        row.appendChild(left);
        row.appendChild(right);
        row.addEventListener('click', function () { alert('Open order ' + o.id + ' (demo)'); });
        ol.appendChild(row);
    });

    // traffic
    document.getElementById('top-source').textContent = data.traffic.source;
    document.getElementById('sessions').textContent = data.traffic.sessions;
    document.getElementById('top-campaign').textContent = data.traffic.campaign;

    // customers
    document.getElementById('new-cust').textContent = data.customers.new;
    document.getElementById('return-rate').textContent = pct(data.customers.returningRate);
    document.getElementById('high-buyers').textContent = data.customers.highValue;

    // aside
    document.getElementById('aside-sales').textContent = fmtCurr(data.meta.sales);
    document.getElementById('aside-badge').textContent = 'Live';

    // low stock
    const ls = document.getElementById('lowstock-list');
    ls.innerHTML = '';
    data.lowstock.forEach(it => {
        const d = document.createElement('div');
        d.className = 'low-item';
        d.innerHTML = `<div><div class="name">${it.name}</div><div class="muted" style="font-size:13px">${it.sku}</div></div><div style="text-align:right"><div class="qty">${it.qty} left</div></div>`;
        ls.appendChild(d);
    });
    document.getElementById('lowcount').textContent = data.lowstock.length + ' items';

    // attention
    document.getElementById('attention-area').innerHTML = `<div class="needs-attention"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:700">${data.attention.verifications} orders require verification</div><div class="muted" style="font-size:13px">Review failed payments / address mismatches</div></div><div style="text-align:right"><div style="font-weight:800;color:var(--sd-danger)">${data.attention.verifications}</div></div></div></div>`;

    // update charts
    updateSalesMiniChart(data.traffic.series);
    updateTrafficChart(data.traffic.series);
}

/* Chart helpers using Chart.js */
// Create and update helpers for Chart.js charts (clean, robust and sized correctly)
function createSalesMiniChart(canvasId, dataSeries) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    // size canvas for device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // destroy existing chart instance if exists
    if (salesMiniChart && typeof salesMiniChart.destroy === 'function') {
        try { salesMiniChart.destroy(); } catch (e) { }
        salesMiniChart = null;
    }

    salesMiniChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataSeries.map((_, i) => i + 1),
            datasets: [{
                data: dataSeries,
                fill: true,
                tension: 0.35,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.08)',
                pointRadius: 3,
                borderWidth: 2
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: true } },
            scales: { x: { display: false }, y: { display: false, beginAtZero: true } }
        }
    });
}

function updateSalesMiniChart(series) {
    if (!salesMiniChart) return;
    salesMiniChart.data.labels = series.map((_, i) => i + 1);
    salesMiniChart.data.datasets[0].data = series;
    salesMiniChart.update();
}

function createTrafficChart(canvasId, series) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (trafficChart && typeof trafficChart.destroy === 'function') {
        try { trafficChart.destroy(); } catch (e) { }
        trafficChart = null;
    }

    const barThickness = Math.max(8, Math.floor(canvas.clientWidth / (series.length * 6)));

    trafficChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: series.map((_, i) => `P${i + 1}`),
            datasets: [{
                label: 'Sessions',
                data: series,
                backgroundColor: series.map(() => 'rgba(37,99,235,0.9)'),
                borderRadius: 6,
                barThickness: barThickness
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
            scales: { x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true } }, y: { beginAtZero: true } }
        }
    });
}

function updateTrafficChart(series) {
    if (!trafficChart) return;
    trafficChart.data.labels = series.map((_, i) => `P${i + 1}`);
    trafficChart.data.datasets[0].data = series;
    trafficChart.update();
}

/* simulate small live updates */
function liveTick() {
    const d = window.DUMMY_DATA;
    d.live.visitors = Math.max(1, d.live.visitors + (Math.random() > 0.5 ? 1 : -1));
    d.live.carts = Math.max(0, d.live.carts + (Math.random() > 0.7 ? 1 : 0));
    if (Math.random() > 0.6) { d.live.events.unshift({ t: 'Order placed', info: 'Order #' + (5770 + Math.floor(Math.random() * 200)) + ' — ₹' + (500 + Math.floor(Math.random() * 4000)) }); if (d.live.events.length > 6) d.live.events.pop(); }
    d.traffic.series.push(12 + Math.floor(Math.random() * 12)); if (d.traffic.series.length > 12) d.traffic.series.shift();
    renderAll(d);
    setTimeout(liveTick, 4000 + Math.random() * 3000);
}

/* init */
window.addEventListener('load', () => {
    createSalesMiniChart('chart-sales-mini', window.DUMMY_DATA.traffic.series);
    createTrafficChart('chart-traffic', window.DUMMY_DATA.traffic.series);
    renderAll(window.DUMMY_DATA);
    setTimeout(liveTick, 2000);
    document.getElementById('sd-refresh').addEventListener('click', () => renderAll(window.DUMMY_DATA));
});

/* Example integration notes (copy into your app):

1) Replace window.DUMMY_DATA with an API fetch:
   fetch('/api/dashboard').then(r=>r.json()).then(data=>{ window.DUMMY_DATA = data; renderAll(data); });

2) To avoid re-creating charts every update, we update datasets via Chart.js methods (see updateTrafficChart/updateSalesMiniChart).

3) Accessibility: each metric tile includes an off-screen description (sr-only) and 'title' attributes so screen readers / hover tooltips present micro-copy.

*/


(function () {
    // Ensure a compact top app bar with hamburger exists and works
    function ensureTopBar() {
        const header = document.querySelector('.storedash-header');
        if (!header) return;

        // create a left container for nav toggle + title
        if (!document.querySelector('.storedash-topbar')) {
            const topbar = document.createElement('div');
            topbar.className = 'storedash-topbar';
            topbar.style.display = 'flex';
            topbar.style.alignItems = 'center';
            topbar.style.gap = '10px';

            // nav toggle
            let btn = document.querySelector('.nav-toggle');
            if (!btn) {
                btn = document.createElement('button');
                btn.className = 'nav-toggle';
                btn.type = 'button';
                btn.setAttribute('aria-label', 'Open menu');
                btn.innerHTML = '☰';
            }
            btn.style.marginRight = '6px';

            // title (visible on small screens)
            const title = document.createElement('div');
            title.className = 'topbar-title';
            title.textContent = 'Dashboard';
            title.style.fontSize = '16px';

            topbar.appendChild(btn);
            topbar.appendChild(title);

            // insert at the start of header, before actions
            header.insertBefore(topbar, header.firstChild);

            // move existing actions to right side if needed
            const actions = header.querySelector('.storedash-actions');
            if (actions) { header.appendChild(actions); }

            // ensure backdrop exists
            if (!document.querySelector('.nav-backdrop')) {
                const b = document.createElement('div');
                b.className = 'nav-backdrop';
                document.body.appendChild(b);
            }

            // wire toggle
            btn.addEventListener('click', toggleNav);
            document.querySelector('.nav-backdrop').addEventListener('click', closeNav);

            // close nav when selecting a menu item
            const menu = document.querySelector('.storedash-menu');
            if (menu) {
                menu.addEventListener('click', function (e) {
                    const btn = e.target.closest('button');
                    if (btn) closeNav();
                });
            }
        }
    }

    function openNav() {
        const nav = document.querySelector('.storedash-nav');
        const backdrop = document.querySelector('.nav-backdrop');
        if (nav) nav.classList.add('mobile-open');
        if (backdrop) backdrop.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    function closeNav() {
        const nav = document.querySelector('.storedash-nav');
        const backdrop = document.querySelector('.nav-backdrop');
        if (nav) nav.classList.remove('mobile-open');
        if (backdrop) backdrop.classList.remove('show');
        document.body.style.overflow = '';
    }
    function toggleNav() {
        const nav = document.querySelector('.storedash-nav');
        if (!nav) return;
        if (nav.classList.contains('mobile-open')) closeNav(); else openNav();
    }

    // init on DOM ready
    document.addEventListener('DOMContentLoaded', function () {
        ensureTopBar();
        // hide nav by default on small screens
        if (window.innerWidth <= 1000) {
            const nav = document.querySelector('.storedash-nav');
            if (nav) nav.classList.remove('mobile-open');
        }
    });

    // ensure charts refresh when toggling size
    window.addEventListener('resize', function () {
        if (typeof createSalesMiniChart === 'function' && window.DUMMY_DATA) createSalesMiniChart('chart-sales-mini', window.DUMMY_DATA.traffic.series || []);
        if (typeof createTrafficChart === 'function' && window.DUMMY_DATA) createTrafficChart('chart-traffic', window.DUMMY_DATA.traffic.series || []);
    });
})();
// Ensure nav is closed initially and menu toggle works robustly
(function () {
    function $(s) { return document.querySelector(s) }
    const nav = $('.storedash-nav');
    const btn = $('.nav-toggle');
    const backdrop = document.querySelector('.nav-backdrop') || (function () { const d = document.createElement('div'); d.className = 'nav-backdrop'; document.body.appendChild(d); return d; })();
    if (!nav) return;
    // Close nav by default on small
    function ensure() { if (window.innerWidth <= 420) { nav.classList.remove('mobile-open'); backdrop.classList.remove('show'); document.body.style.overflow = ''; } }
    // wire button
    if (btn) { btn.removeEventListener('click', window._navToggleFn); window._navToggleFn = function () { if (nav.classList.contains('mobile-open')) { nav.classList.remove('mobile-open'); backdrop.classList.remove('show'); document.body.style.overflow = ''; } else { nav.classList.add('mobile-open'); backdrop.classList.add('show'); document.body.style.overflow = 'hidden'; } }; btn.addEventListener('click', window._navToggleFn); }
    backdrop.addEventListener('click', function () { nav.classList.remove('mobile-open'); backdrop.classList.remove('show'); document.body.style.overflow = ''; });
    window.addEventListener('resize', ensure);
    document.addEventListener('DOMContentLoaded', ensure);
})();

(function () {
    const nav = document.querySelector('.storedash-nav');
    if (!nav) return;

    const items = Array.from(nav.querySelectorAll('.storedash-item.has-sub'));

    function closeAll() {
        items.forEach(it => {
            it.setAttribute('aria-expanded', 'false');
            const panel = it.querySelector('.storedash-submenu');
            if (panel) panel.setAttribute('aria-hidden', 'true');
        });
    }

    items.forEach(item => {
        const btn = item.querySelector('button');
        const panel = item.querySelector('.storedash-submenu');

        // ensure initial accessibility attributes
        if (!item.hasAttribute('aria-expanded')) item.setAttribute('aria-expanded', 'false');
        if (panel && !panel.hasAttribute('aria-hidden')) panel.setAttribute('aria-hidden', 'true');

        // click toggles submenu
        btn.addEventListener('click', (e) => {
            const isOpen = item.getAttribute('aria-expanded') === 'true';
            // close others (single-open behavior); remove if you want multiple open
            closeAll();
            if (!isOpen) {
                item.setAttribute('aria-expanded', 'true');
                if (panel) panel.setAttribute('aria-hidden', 'false');
                // focus first link inside panel for keyboard users
                const first = panel && panel.querySelector('[role=\"menuitem\"]');
                if (first) first.focus();
            } else {
                item.setAttribute('aria-expanded', 'false');
                if (panel) panel.setAttribute('aria-hidden', 'true');
            }
            e.stopPropagation();
        });

        // keyboard support: Enter/Space opens, Escape closes
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            } else if (e.key === 'Escape') {
                item.setAttribute('aria-expanded', 'false');
                if (panel) panel.setAttribute('aria-hidden', 'true');
                btn.focus();
            }
        });
    });

    // close if clicked outside nav
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target)) closeAll();
    });

    // close all on Escape globally
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

})();