/* ============================================================
   Dancing Queen · Site Core
   移动端菜单 / 购物车 / 结算 / Toast
   ============================================================ */
(function () {
  'use strict';

  var CART_KEY = 'dq_cart_v1';

  var CONTACT = {
    wechat: 'abc568347492',
    phone: '+86 13738901892',
    whatsapp: '+86 13738901892',
    whatsappNumber: '8613738901892'
  };

  window.DQ_CONTACT = CONTACT;

  /* ---------- PayPal 配置 ----------
     把 Client ID 粘到 clientId 里即可自动启用 PayPal 支付。
     获取：https://developer.paypal.com → Apps & Credentials → Create App
     先用 Sandbox（测试），测试通过后换成 Live（正式）。
  ------------------------------------ */
  var PAYPAL = {
    clientId: '',            // ← 例如 'AeA1QIZ1234567890abcdefg'
    currency: 'USD'
  };
  var PAYPAL_ENABLED = String(PAYPAL.clientId || '').length > 10;

  /* ---------- helpers ---------- */
  function catalog() { return window.DQ_PRODUCTS || {}; }

  function money(n) {
    n = Number(n) || 0;
    return '$' + (Math.abs(n % 1) < 0.005 ? n.toFixed(0) : n.toFixed(2));
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toast(msg) {
    var el = document.getElementById('dq-toast');
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.style.opacity = '0'; }, 2200);
  }

  /* ---------- cart storage ---------- */
  function getCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(CART_KEY));
      if (!Array.isArray(raw)) return [];
      return raw.filter(function (i) { return i && catalog()[i.id]; });
    } catch (e) { return []; }
  }

  function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    renderCart();
    renderCount();
  }

  function addToCart(id, qty) {
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var cart = getCart();
    var found = false;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id) { cart[i].qty += qty; found = true; break; }
    }
    if (!found) cart.push({ id: id, qty: qty });
    saveCart(cart);
  }

  function setQty(id, qty) {
    var cart = getCart();
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id) {
        cart[i].qty = Math.max(0, parseInt(qty, 10) || 0);
        if (cart[i].qty === 0) cart.splice(i, 1);
        break;
      }
    }
    saveCart(cart);
  }

  function removeItem(id) {
    saveCart(getCart().filter(function (i) { return i.id !== id; }));
  }

  function cartCount() {
    return getCart().reduce(function (s, i) { return s + i.qty; }, 0);
  }

  function cartTotal() {
    return getCart().reduce(function (s, i) {
      var p = catalog()[i.id];
      return s + (p ? p.price * i.qty : 0);
    }, 0);
  }

  /* ---------- cart UI ---------- */
  function ensureUI() {
    if (document.getElementById('dq-cart')) return;

    var holder = document.createElement('div');
    holder.innerHTML = [
      '<div id="dq-overlay" class="fixed inset-0 bg-black/40 z-[80] hidden"></div>',

      '<aside id="dq-cart" class="fixed top-0 right-0 h-full w-full sm:max-w-md bg-[#f7f4ef] z-[90] translate-x-full transition-transform duration-300 flex flex-col shadow-2xl">',
      '  <div class="flex items-center justify-between px-6 h-16 border-b border-[#0f0f14]/10 shrink-0">',
      '    <p class="font-display text-xl">Your Cart <span class="text-[#b8935a] text-base" data-cart-count>(0)</span></p>',
      '    <button type="button" data-cart-close class="text-3xl leading-none text-[#0f0f14]/40 hover:text-[#b8935a] transition-colors">&times;</button>',
      '  </div>',
      '  <div data-cart-items class="flex-1 overflow-y-auto px-6 py-5"></div>',
      '  <div class="border-t border-[#0f0f14]/10 px-6 py-5 shrink-0 space-y-4">',
      '    <div class="flex items-center justify-between">',
      '      <span class="text-xs tracking-[0.2em] uppercase text-[#0f0f14]/50">Total</span>',
      '      <span class="font-display text-2xl text-[#b8935a]" data-cart-total>$0</span>',
      '    </div>',
      '    <button type="button" data-checkout-open class="w-full bg-[#0f0f14] text-[#f7f4ef] py-4 text-xs tracking-[0.2em] uppercase hover:bg-[#b8935a] transition-colors duration-300">Checkout · 去结算</button>',
      '    <button type="button" data-cart-close class="w-full text-xs tracking-[0.15em] uppercase text-[#0f0f14]/45 hover:text-[#b8935a] transition-colors">Continue Shopping · 继续逛</button>',
      '  </div>',
      '</aside>',

      '<div id="dq-checkout" class="fixed inset-0 z-[100] hidden">',
      '  <div class="absolute inset-0 bg-black/50" data-checkout-close></div>',
      '  <div class="relative h-full w-full flex items-center justify-center p-4">',
      '    <div class="bg-[#f7f4ef] w-full max-w-lg max-h-full overflow-y-auto p-6 md:p-8">',
      '      <div class="flex items-start justify-between gap-4 mb-5">',
      '        <div>',
      '          <p class="text-[#b8935a] text-xs tracking-[0.25em] uppercase mb-2">Checkout</p>',
      '          <h2 class="font-display text-3xl font-light">Order Summary</h2>',
      '        </div>',
      '        <button type="button" data-checkout-close class="text-3xl leading-none text-[#0f0f14]/40 hover:text-[#b8935a] transition-colors">&times;</button>',
      '      </div>',
      '      <div class="flex items-center justify-between border-y border-[#0f0f14]/10 py-4 mb-5">',
      '        <span class="text-xs tracking-[0.2em] uppercase text-[#0f0f14]/50">Total</span>',
      '        <span class="font-display text-3xl text-[#b8935a]" data-checkout-total>$0</span>',
      '      </div>',
      '      <div id="dq-pay-tabs" class="grid grid-cols-2 gap-px bg-[#0f0f14]/10 mb-5 hidden">',
      '        <button type="button" data-pay-tab="paypal" class="bg-white py-3 text-[11px] tracking-[0.15em] uppercase text-[#0f0f14]/60 transition-colors">Card / PayPal</button>',
      '        <button type="button" data-pay-tab="qr" class="bg-white py-3 text-[11px] tracking-[0.15em] uppercase text-[#0f0f14]/60 transition-colors">WeChat / Alipay</button>',
      '      </div>',
      '      <div data-pay-panel="paypal" class="mb-6 hidden">',
      '        <p class="text-xs text-[#0f0f14]/50 leading-relaxed mb-4">Pay securely with credit card, debit card or your PayPal account. No PayPal account required.<br>支持信用卡 / 借记卡付款，无需 PayPal 账户。</p>',
      '        <div id="paypal-button-container"></div>',
      '        <p data-paypal-msg class="text-xs mt-3 hidden"></p>',
      '      </div>',
      '      <div data-pay-panel="qr" class="mb-6">',
      '        <div class="grid grid-cols-2 gap-3 mb-4">',
      '          <div class="text-center">',
      '            <div class="aspect-square bg-white border border-[#0f0f14]/10 rounded-sm p-2"><img src="images/payments/wechat-pay.jpg" alt="WeChat Pay QR" class="w-full h-full object-contain"></div>',
      '            <p class="text-[11px] text-[#0f0f14]/60 mt-2">微信支付 · WeChat Pay</p>',
      '          </div>',
      '          <div class="text-center">',
      '            <div class="aspect-square bg-white border border-[#0f0f14]/10 rounded-sm p-2"><img src="images/payments/alipay.jpg" alt="Alipay QR" class="w-full h-full object-contain"></div>',
      '            <p class="text-[11px] text-[#0f0f14]/60 mt-2">支付宝 · Alipay</p>',
      '          </div>',
      '        </div>',
      '        <p class="text-xs text-[#0f0f14]/50 leading-relaxed">扫码付款后，把下面订单信息补全并发送给我们确认即可发货。<br>After payment, complete the details below and send it to us.</p>',
      '      </div>',
      '      <label class="block text-xs tracking-[0.15em] uppercase text-[#0f0f14]/50 mb-2">Order details · 订单信息</label>',
      '      <textarea data-order-text rows="9" class="w-full border border-[#0f0f14]/15 bg-white p-3 text-sm leading-relaxed font-light focus:outline-none focus:border-[#b8935a] transition-colors"></textarea>',
      '      <div class="grid grid-cols-2 gap-3 mt-4">',
      '        <button type="button" data-copy-order class="border border-[#0f0f14]/20 py-3 text-xs tracking-[0.15em] uppercase hover:border-[#b8935a] hover:text-[#b8935a] transition-colors">Copy · 复制</button>',
      '        <a data-wa-order target="_blank" rel="noopener" class="bg-[#0f0f14] text-[#f7f4ef] py-3 text-center text-xs tracking-[0.15em] uppercase hover:bg-[#b8935a] transition-colors">WhatsApp</a>',
      '      </div>',
      '      <p class="text-xs text-[#0f0f14]/50 mt-5 text-center">微信 · WeChat <span class="text-[#b8935a] font-medium select-all">' + esc(CONTACT.wechat) + '</span></p>',
      '    </div>',
      '  </div>',
      '</div>',

      '<div id="dq-toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] bg-[#0f0f14] text-[#f7f4ef] px-6 py-3 text-xs tracking-[0.15em] uppercase opacity-0 pointer-events-none transition-opacity duration-300 whitespace-nowrap"></div>'
    ].join('');

    document.body.appendChild(holder);
  }

  function renderCount() {
    var n = cartCount();
    var nodes = document.querySelectorAll('[data-cart-count]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = nodes[i].hasAttribute('data-cart-count-plain') ? String(n) : '(' + n + ')';
      var dot = nodes[i].classList.contains('dq-cart-dot');
      if (dot) nodes[i].style.display = n > 0 ? 'flex' : 'none';
    }
  }

  function renderCart() {
    var box = document.querySelector('[data-cart-items]');
    if (!box) return;

    var cart = getCart();
    var totalEl = document.querySelector('[data-cart-total]');
    if (totalEl) totalEl.textContent = money(cartTotal());

    if (!cart.length) {
      box.innerHTML = [
        '<div class="h-full flex flex-col items-center justify-center text-center py-16">',
        '  <p class="font-display text-2xl text-[#0f0f14]/70 mb-2">Your cart is empty</p>',
        '  <p class="text-xs text-[#0f0f14]/40 mb-6">购物车还是空的</p>',
        '  <a href="products.html" data-cart-close class="text-xs tracking-[0.2em] uppercase border border-[#0f0f14]/20 px-6 py-3 hover:border-[#b8935a] hover:text-[#b8935a] transition-colors">Browse Collection</a>',
        '</div>'
      ].join('');
      return;
    }

    var html = cart.map(function (item) {
      var p = catalog()[item.id];
      return [
        '<div class="flex gap-4 pb-5 border-b border-[#0f0f14]/10">',
        '  <a href="product-detail.html?product=' + esc(p.id) + '" class="w-20 h-24 shrink-0 overflow-hidden rounded-sm bg-[#8a7e72]/10">',
        '    <img src="' + esc(p.thumb) + '" alt="' + esc(p.name) + '" class="w-full h-full object-cover">',
        '  </a>',
        '  <div class="flex-1 min-w-0">',
        '    <a href="product-detail.html?product=' + esc(p.id) + '" class="font-display text-lg leading-snug hover:text-[#b8935a] transition-colors block">' + esc(p.name) + '</a>',
        '    <p class="text-[11px] text-[#0f0f14]/40 mt-1 truncate">' + esc(p.tagline) + '</p>',
        '    <div class="flex items-center justify-between mt-3">',
        '      <div class="flex items-center border border-[#0f0f14]/15">',
        '        <button type="button" data-qty-dec="' + esc(p.id) + '" class="w-7 h-7 text-[#0f0f14]/60 hover:text-[#b8935a] transition-colors">&minus;</button>',
        '        <span class="w-8 text-center text-xs">' + item.qty + '</span>',
        '        <button type="button" data-qty-inc="' + esc(p.id) + '" class="w-7 h-7 text-[#0f0f14]/60 hover:text-[#b8935a] transition-colors">+</button>',
        '      </div>',
        '      <span class="font-display text-lg text-[#b8935a]">' + money(p.price * item.qty) + '</span>',
        '    </div>',
        '    <button type="button" data-remove="' + esc(p.id) + '" class="text-[11px] text-[#0f0f14]/35 hover:text-[#b8935a] mt-2 underline underline-offset-2 transition-colors">Remove</button>',
        '  </div>',
        '</div>'
      ].join('');
    });
    box.innerHTML = html.join('');
  }

  function openCart() {
    ensureUI();
    var cart = document.getElementById('dq-cart');
    var ov = document.getElementById('dq-overlay');
    renderCart();
    renderCount();
    ov.classList.remove('hidden');
    cart.classList.remove('translate-x-full');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    var cart = document.getElementById('dq-cart');
    var ov = document.getElementById('dq-overlay');
    if (!cart) return;
    cart.classList.add('translate-x-full');
    ov.classList.add('hidden');
    document.body.style.overflow = '';
  }

  /* ---------- checkout ---------- */
  function buildOrderText() {
    var cart = getCart();
    var lines = ['New Order · Dancing Queen 念珠手作', ''];
    cart.forEach(function (item, i) {
      var p = catalog()[item.id];
      if (!p) return;
      lines.push((i + 1) + '. ' + p.name + '  ×' + item.qty + '  — ' + money(p.price * item.qty));
    });
    lines.push('');
    lines.push('Total: ' + money(cartTotal()));
    lines.push('');
    lines.push('Name / 姓名：');
    lines.push('Phone / 电话：');
    lines.push('Address / 收货地址：');
    lines.push('Note / 备注：');
    return lines.join('\n');
  }

  function openCheckout() {
    var modal = document.getElementById('dq-checkout');
    if (!modal) return;
    var ta = modal.querySelector('[data-order-text]');
    var wa = modal.querySelector('[data-wa-order]');
    var text = buildOrderText();
    if (ta) ta.value = text;
    if (wa) wa.href = 'https://wa.me/' + CONTACT.whatsappNumber + '?text=' + encodeURIComponent(text);
    modal.classList.remove('hidden');
    initCheckoutUI();
  }

  function closeCheckout() {
    var modal = document.getElementById('dq-checkout');
    if (modal) modal.classList.add('hidden');
  }

  /* ---------- PayPal 支付 ---------- */
  var paypalLoading = false;
  var paypalRendered = false;

  function showPaypalMsg(msg, ok) {
    var el = document.querySelector('[data-paypal-msg]');
    if (!el) return;
    el.innerHTML = msg;
    el.className = ok
      ? 'text-xs mt-3 leading-relaxed text-[#0f8a4a]'
      : 'text-xs mt-3 leading-relaxed text-red-500';
  }

  function loadPayPalSDK(done) {
    if (window.paypal) return done(true);
    if (paypalLoading) return;
    paypalLoading = true;
    var s = document.createElement('script');
    s.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(PAYPAL.clientId) +
            '&currency=' + encodeURIComponent(PAYPAL.currency) + '&intent=capture&components=buttons';
    s.onload = function () { done(true); };
    s.onerror = function () { done(false); };
    document.head.appendChild(s);
  }

  function renderPayPal() {
    if (!PAYPAL_ENABLED || paypalRendered) return;
    var box = document.getElementById('paypal-button-container');
    if (!box || cartTotal() <= 0) return;

    loadPayPalSDK(function (ok) {
      if (!ok || !window.paypal || paypalRendered) {
        showPaypalMsg('PayPal failed to load. Please use WeChat / Alipay below.<br>PayPal 加载失败，请使用下方扫码支付。', false);
        return;
      }
      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal', height: 45, tagline: false },
        createOrder: function (data, actions) {
          return actions.order.create({
            purchase_units: [{
              description: 'Dancing Queen · Incense Bead Bracelets',
              amount: { value: cartTotal().toFixed(2), currency_code: PAYPAL.currency }
            }]
          });
        },
        onApprove: function (data, actions) {
          return actions.order.capture().then(function (details) {
            onPayPalSuccess(details);
          });
        },
        onError: function () {
          showPaypalMsg('Payment could not be completed. Please try again or contact us.<br>支付未完成，请重试或联系我们。', false);
        },
        onCancel: function () {
          showPaypalMsg('Payment cancelled. You can try again anytime.<br>已取消支付，可随时重试。', false);
        }
      }).render('#paypal-button-container').then(function () {
        paypalRendered = true;
      });
    });
  }

  function onPayPalSuccess(details) {
    var payer = (details && details.payer) || {};
    var nm = payer.name || {};
    var fullName = [nm.given_name, nm.surname].filter(Boolean).join(' ');
    var email = payer.email_address || '';
    var tx = (details && details.id) || '';

    var ta = document.querySelector('[data-order-text]');
    if (ta) {
      ta.value = buildOrderText() +
        '\n\n--- PayPal Payment ---' +
        '\nPaid: ' + money(cartTotal()) +
        '\nName: ' + fullName +
        '\nEmail: ' + email +
        '\nTransaction ID: ' + tx;
    }

    showPaypalMsg('✓ Payment received. Please send the order details below to us (WhatsApp / WeChat) so we can arrange shipping.<br>✓ 支付成功。请把下方订单信息通过 WhatsApp 或微信发给我们，以便安排发货。', true);
    toast('Payment received · 支付成功');
  }

  /* ---------- 支付方式标签切换 ---------- */
  function setPayTab(name) {
    var tabs = document.querySelectorAll('[data-pay-tab]');
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute('data-pay-tab') === name;
      tabs[i].className = on
        ? 'bg-[#0f0f14] text-[#f7f4ef] py-3 text-[11px] tracking-[0.15em] uppercase transition-colors'
        : 'bg-white text-[#0f0f14]/60 py-3 text-[11px] tracking-[0.15em] uppercase hover:text-[#b8935a] transition-colors';
    }
    var panels = document.querySelectorAll('[data-pay-panel]');
    for (var j = 0; j < panels.length; j++) {
      panels[j].classList.toggle('hidden', panels[j].getAttribute('data-pay-panel') !== name);
    }
    if (name === 'paypal') renderPayPal();
  }

  function defaultPayTab() {
    if (!PAYPAL_ENABLED) return 'qr';
    var lang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    return lang.indexOf('zh') === 0 ? 'qr' : 'paypal';
  }

  function initCheckoutUI() {
    var totalEl = document.querySelector('[data-checkout-total]');
    if (totalEl) totalEl.textContent = money(cartTotal());

    var tabs = document.getElementById('dq-pay-tabs');
    if (tabs && PAYPAL_ENABLED) tabs.classList.remove('hidden');

    setPayTab(defaultPayTab());
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject();
      } catch (e) { document.body.removeChild(ta); reject(e); }
    });
  }

  /* ---------- mobile menu ---------- */
  function toggleMenu(force) {
    var menu = document.querySelector('[data-menu]');
    if (!menu) return;
    var willOpen = typeof force === 'boolean' ? force : menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !willOpen);
    var btn = document.querySelector('[data-menu-toggle]');
    if (btn) btn.setAttribute('aria-expanded', String(willOpen));
  }

  /* ---------- global events ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;

    var add = t.closest('[data-add-to-cart]');
    if (add) {
      e.preventDefault();
      var id = add.getAttribute('data-add-to-cart');
      var qtyEl = document.querySelector('[data-qty]');
      var qty = qtyEl ? parseInt(qtyEl.value, 10) || 1 : 1;
      if (!catalog()[id]) { toast('Product not found'); return; }
      addToCart(id, qty);
      toast('Added to cart · 已加入购物车');
      return;
    }

    var openBtn = t.closest('[data-cart-open]');
    if (openBtn) { e.preventDefault(); openCart(); return; }

    var closeBtn = t.closest('[data-cart-close]');
    if (closeBtn) { e.preventDefault(); closeCart(); return; }

    if (t.closest('[data-checkout-open]')) { e.preventDefault(); openCheckout(); return; }
    if (t.closest('[data-checkout-close]')) { e.preventDefault(); closeCheckout(); return; }

    var payTab = t.closest('[data-pay-tab]');
    if (payTab) { e.preventDefault(); setPayTab(payTab.getAttribute('data-pay-tab')); return; }

    var inc = t.closest('[data-qty-inc]');
    if (inc) {
      var iid = inc.getAttribute('data-qty-inc');
      setQty(iid, (getCart().filter(function (i) { return i.id === iid; })[0] || { qty: 0 }).qty + 1);
      return;
    }

    var dec = t.closest('[data-qty-dec]');
    if (dec) {
      var did = dec.getAttribute('data-qty-dec');
      var cur = (getCart().filter(function (i) { return i.id === did; })[0] || { qty: 0 }).qty;
      setQty(did, cur - 1);
      return;
    }

    var rm = t.closest('[data-remove]');
    if (rm) { removeItem(rm.getAttribute('data-remove')); toast('Removed'); return; }

    var copy = t.closest('[data-copy-order]');
    if (copy) {
      var modal = document.getElementById('dq-checkout');
      var text = modal.querySelector('[data-order-text]').value;
      copyText(text).then(function () { toast('Copied · 已复制'); })
        .catch(function () { toast('Copy failed, please select manually'); });
      return;
    }

    var waBtn = t.closest('[data-wa-order]');
    if (waBtn) {
      var m2 = document.getElementById('dq-checkout');
      waBtn.href = 'https://wa.me/' + CONTACT.whatsappNumber + '?text=' +
        encodeURIComponent(m2.querySelector('[data-order-text]').value);
      return;
    }

    if (t.closest('[data-menu-toggle]')) { toggleMenu(); return; }
    if (t.closest('[data-menu] a')) { toggleMenu(false); return; }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeCart(); closeCheckout(); toggleMenu(false); }
  });

  /* ---------- init ---------- */
  function init() {
    ensureUI();
    renderCart();
    renderCount();
    toggleMenu(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.DQ = {
    addToCart: addToCart,
    openCart: openCart,
    closeCart: closeCart,
    getCart: getCart,
    cartCount: cartCount,
    cartTotal: cartTotal,
    money: money,
    contact: CONTACT
  };
})();
