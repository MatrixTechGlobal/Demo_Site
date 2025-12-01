(function () {
    const wrapper = document.querySelector('.ns-checkout-wrapper');
    if (!wrapper) return;

    const root = wrapper.querySelector('#ns-checkout') || wrapper.querySelector('#checkout') || wrapper.querySelector('#ns-checkout');
    if (!root) return;

    const steps = () => Array.from(root.querySelectorAll('.ns-stepform__step'));
    const panels = () => Array.from(root.querySelectorAll('.ns-step'));
    const progressFill = wrapper.querySelector('.ns-progressbar__fill') || root.querySelector('#ns-progressFill') || root.querySelector('#progressFill');
    let current = 0;

    // Pricing & qty
    const qtyEl = root.querySelector('#ns-qty');
    let qty = parseInt(qtyEl ? qtyEl.textContent : '1', 10) || 1;
    const subtotalEl = root.querySelector('#ns-subtotal');
    const asideSubtotal = root.querySelector('#ns-asideSubtotal');
    const asideTotal = root.querySelector('#ns-asideTotal');
    const asideShipping = root.querySelector('#ns-asideShipping');
    const asideMethodPreview = root.querySelector('#ns-asideMethodPreview');
    const revQty = root.querySelector('#ns-revQty');
    const revTotal = root.querySelector('#ns-revTotal');
    const revPrice = root.querySelector('#ns-revPrice');
    const revMethod = root.querySelector('#ns-revMethod');
    const revShip = root.querySelector('#ns-revShip');
    const UNIT_PRICE = 6999;

    // Shipping UI hooks (moved to aside)
    const methodsRoot = root.querySelector('#ns-methodsAside');
    const pincodeInput = root.querySelector('#ns-pincode');

    // Simple cart object for weight/qty/subtotal tracking
    const cart = {
        items: [
            { id: 1, weight: 1.2, qty: qty, price: UNIT_PRICE }
        ],
        subtotal: UNIT_PRICE
    };

    // selected shipping method state
    let selectedMethod = null;

    function updatePrices() {
        const total = UNIT_PRICE * qty;
        cart.items[0].qty = qty;
        cart.subtotal = total;

        if (subtotalEl) subtotalEl.textContent = '₹ ' + total.toLocaleString();
        if (asideSubtotal) asideSubtotal.textContent = total.toLocaleString();

        // Update aside total using current shipping value (if any)
        const shipVal = parseFloat((asideShipping && asideShipping.textContent) ? asideShipping.textContent.replace(/[^\d\.]/g, '') : '0') || 0;
        if (asideTotal) asideTotal.textContent = (total + shipVal).toLocaleString();

        if (revQty) revQty.textContent = qty;
        if (revTotal) revTotal.textContent = total.toLocaleString();
        if (revPrice) revPrice.textContent = UNIT_PRICE.toLocaleString();
    }

    // qty handlers
    wrapper.querySelectorAll('.ns-qty-increase').forEach(btn => {
        btn.addEventListener('click', () => {
            qty = Math.min(99, qty + 1);
            if (qtyEl) qtyEl.textContent = qty;
            updatePrices();
            fetchQuotesIfNeeded();
        });
    });
    wrapper.querySelectorAll('.ns-qty-decrease').forEach(btn => {
        btn.addEventListener('click', () => {
            qty = Math.max(1, qty - 1);
            if (qtyEl) qtyEl.textContent = qty;
            updatePrices();
            fetchQuotesIfNeeded();
        });
    });
    updatePrices();

    // click on step chips
    steps().forEach((s, i) => {
        s.addEventListener('click', () => goTo(i));
        s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(i); } });
    });

    // next/prev controllers
    wrapper.querySelectorAll('[data-next]').forEach(btn => {
        btn.addEventListener('click', () => {
            const curForm = wrapper.querySelector('.ns-form[data-step="' + current + '"]');
            if (curForm) {
                if (!validateForm(curForm)) return;
            }
            goTo(current + 1);
        });
    });
    wrapper.querySelectorAll('[data-prev]').forEach(btn => {
        btn.addEventListener('click', () => goTo(current - 1));
    });

    // submit (place order)
    wrapper.querySelectorAll('.ns-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!validateForm(form)) return;
            goTo(3); // success index
        });
    });

    function validateForm(form) {
        const fields = Array.from(form.querySelectorAll('[required]'));
        let ok = true;
        fields.forEach(f => {
            const err = form.querySelector('[data-for="' + f.id + '"]');
            if (!f.value || !String(f.value).trim()) {
                ok = false;
                if (err) err.style.display = 'block';
                f.setAttribute('aria-invalid', 'true');
            } else {
                if (err) err.style.display = 'none';
                f.removeAttribute('aria-invalid');
            }
        });
        return ok;
    }

    function getActiveStepIndex() {
        const s = steps();
        const ariaIndex = s.findIndex(x => x.getAttribute('aria-current') === 'true');
        if (ariaIndex >= 0) return ariaIndex;

        const p = panels();
        for (let el of p) {
            const style = window.getComputedStyle(el);
            if (style && style.display !== 'none' && el.dataset && el.dataset.step && el.dataset.step !== '3') { // exclude final success
                const ds = parseInt(el.dataset.step, 10);
                if (!Number.isNaN(ds)) return ds;
            }
        }
        return 0;
    }

    function updateProgressNormal(index, total) {
        if (!progressFill) return;
        const pct = Math.round(((index + 1) / (total + 1)) * 100);
        progressFill.style.width = pct + '%';
    }

    // =============================
    // goTo() — progress 100% on success
    // =============================
    function goTo(index) {
        if (typeof index !== 'number') index = parseInt(index, 10) || 0;
        const total = steps().length;
        if (index < 0) index = 0;
        if (index > total) index = total;

        panels().forEach(p => p.style.display = 'none');
        steps().forEach((s, i) => { try { s.setAttribute('aria-current', i === index ? 'true' : 'false'); } catch (e) { } });

        const toShow = wrapper.querySelector('.ns-step[data-step="' + index + '"]');
        if (toShow) toShow.style.display = 'block';

        if (index === 2) {
            const shipVal = (root.querySelector('#ns-address1') && root.querySelector('#ns-address1').value) || '—';
            if (revShip) revShip.textContent = shipVal;
            if (revMethod) revMethod.textContent = selectedMethod ? `${selectedMethod.method} • ₹ ${Number(selectedMethod.price).toFixed(2)}` : '—';
            updateSummary(selectedMethod ? Number(selectedMethod.price) : 0);
        }

        setTimeout(() => {
            const vis = wrapper.querySelector('.ns-step:not([style*="display: none"])');
            if (vis) {
                const first = vis.querySelector('input, button, select, textarea');
                if (first) first.focus();
            }
        }, 40);

        current = index;

        if (progressFill) {
            if (index === total) progressFill.style.width = '100%';
            else updateProgressNormal(index, total);
        }

        if (index === 1) {
            fetchQuotes();
            setTimeout(() => { if (pincodeInput) pincodeInput.focus(); }, 120);
        }
    }

    // init
    (function init() {
        const initial = getActiveStepIndex();
        panels().forEach(p => p.style.display = 'none');
        const start = wrapper.querySelector('.ns-step[data-step="' + initial + '"]') || wrapper.querySelector('.ns-step[data-step="0"]');
        if (start) start.style.display = 'block';
        current = initial || 0;
        const total = steps().length;
        if (progressFill) {
            if (current === total) progressFill.style.width = '100%';
            else updateProgressNormal(current, total);
        }

        // initial render of shipping methods (aside)
        fetchQuotes();
    })();

    // observe changes to aria-current (progress guard)
    try {
        const chipList = steps();
        if (chipList.length) {
            const mo = new MutationObserver((mutations) => {
                for (const m of mutations) {
                    if (m.type === 'attributes' && m.attributeName === 'aria-current') {
                        const total = steps().length;
                        const idx = getActiveStepIndex();
                        if (progressFill) {
                            if (idx === total) progressFill.style.width = '100%';
                            else updateProgressNormal(idx, total);
                        }
                        break;
                    }
                }
            });
            chipList.forEach(c => mo.observe(c, { attributes: true, attributeFilter: ['aria-current'] }));
        }
    } catch (e) { /* ignore */ }

    // accessibility for errors
    wrapper.querySelectorAll('.ns-error').forEach(e => {
        if (!e.hasAttribute('role')) e.setAttribute('role', 'status');
        if (!e.hasAttribute('aria-live')) e.setAttribute('aria-live', 'polite');
    });

    window.addEventListener('resize', () => setTimeout(() => {
        const total = steps().length;
        const idx = getActiveStepIndex();
        if (progressFill) {
            if (idx === total) progressFill.style.width = '100%';
            else updateProgressNormal(idx, total);
        }
    }, 80));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') goTo(Math.max(0, current - 1)); });

    // -----------------------
    // Local Shipping Rule Engine (NO external calls)
    // -----------------------

    function computeCartWeight() {
        return cart.items.reduce((s, i) => s + (i.weight * (i.qty || 1)), 0);
    }

    function getLocalShippingMethods(subtotal, pincode, weightKg) {
        const rules = [
            { method: "Standard Delivery", base: 60, freeOver: 5000, eta: 3 },
            { method: "Express Delivery", base: 250, freeOver: Infinity, eta: 1 }
        ];
        return rules.map(r => {
            const price = subtotal >= (r.freeOver || Infinity) ? 0 : r.base;
            return { method: r.method, price: Number(price), estimated_days: r.eta };
        });
    }

    // render methods inside aside (ns-methodsAside)
    function renderMethods(methods) {
        if (!methodsRoot) return;
        methodsRoot.innerHTML = '';
        if (!methods || methods.length === 0) {
            methodsRoot.innerHTML = '<div class="muted">No shipping methods available for this address.</div>';
            selectedMethod = null;
            updateSummary(0);
            updateAsidePreview(null);
            return;
        }

        methods.forEach((m, idx) => {
            const el = document.createElement('div');
            el.className = 'shipping-method' + (idx === 0 ? ' selected' : '');
            el.setAttribute('role', 'button');
            el.setAttribute('tabindex', '0');
            el.innerHTML = `<div>
                                <div class="method-name">${escapeHtml(m.method)}</div>
                                <div class="method-meta muted">ETA: ${m.estimated_days} days</div>
                              </div>
                              <div style="text-align:right;">
                                <div style="font-weight:700">₹ ${Number(m.price).toFixed(2)}</div>
                              </div>`;
            el.addEventListener('click', () => { selectMethod(m, el); });
            el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectMethod(m, el); } });
            methodsRoot.appendChild(el);

            if (idx === 0) {
                selectedMethod = { ...m };
            }
        });

        // ensure UI reflects selected first method
        updateSummary(selectedMethod ? Number(selectedMethod.price) : 0);
        updateAsidePreview(selectedMethod);
        // add selected class to first element visually
        const first = methodsRoot.querySelector('.shipping-method');
        if (first) methodsRoot.querySelectorAll('.shipping-method').forEach(x => x.classList.remove('selected'));
        if (first) first.classList.add('selected');
    }

    function selectMethod(m, el) {
        methodsRoot.querySelectorAll('.shipping-method').forEach(x => x.classList.remove('selected'));
        if (el) el.classList.add('selected');
        selectedMethod = { ...m };
        updateSummary(Number(m.price));
        updateAsidePreview(selectedMethod);
        if (revMethod) revMethod.textContent = `${selectedMethod.method} • ₹ ${Number(selectedMethod.price).toFixed(2)}`;
    }

    function updateSummary(price) {
        price = Number(price) || 0;
        if (asideShipping) asideShipping.textContent = price.toFixed(2);
        const total = cart.subtotal + price;
        if (asideTotal) asideTotal.textContent = total.toLocaleString();
        const revTotalEl = root.querySelector('#ns-revTotal');
        if (revTotalEl) revTotalEl.textContent = total.toLocaleString();
    }

    function updateAsidePreview(m) {
        if (!asideMethodPreview) return;
        if (!m) {
            asideMethodPreview.innerHTML = `<span class="small-muted">Select method</span>`;
            return;
        }
        // show method name + badge
        asideMethodPreview.innerHTML = `<span style="font-weight:700">${escapeHtml(m.method)}</span>
                                            <span class="badge">Selected</span>
                                            <div class="small-muted" style="margin-left:8px;font-weight:500;font-size:12px">₹ ${Number(m.price).toFixed(2)}</div>`;
    }

    function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }

    function fetchQuotes() {
        if (!methodsRoot) return;
        methodsRoot.innerHTML = '<div class="muted">Loading shipping options…</div>';
        setTimeout(() => {
            const pincode = (pincodeInput && pincodeInput.value) ? pincodeInput.value : '560001';
            const weight = computeCartWeight();
            const methods = getLocalShippingMethods(cart.subtotal, pincode, weight);
            renderMethods(methods);
        }, 180);
    }

    // debounce helper
    let fetchTimer = null;
    function fetchQuotesIfNeeded() {
        if (current !== 1) {
            updateSummary(selectedMethod ? Number(selectedMethod.price) : 0);
            updateAsidePreview(selectedMethod);
            return;
        }
        if (fetchTimer) clearTimeout(fetchTimer);
        fetchTimer = setTimeout(fetchQuotes, 220);
    }

    if (pincodeInput) {
        pincodeInput.addEventListener('input', () => fetchQuotesIfNeeded());
    }

})();