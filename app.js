(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const msgsEl = $('#i18n-msgs');
  const M = msgsEl ? JSON.parse(msgsEl.textContent) : {};

  // Mobile menu
  const mobileBtn = $('#mobile-menu-btn'), mobileMenu = $('#mobile-menu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('hidden') === false;
      mobileBtn.setAttribute('aria-expanded', open);
    });
    $$('a', mobileMenu).forEach(a => a.addEventListener('click', () => { mobileMenu.classList.add('hidden'); mobileBtn.setAttribute('aria-expanded', 'false'); }));
  }

  // Image fallback: hide broken photos, gradient shows through
  $$('img').forEach(img => img.addEventListener('error', () => { img.style.display = 'none'; }));

  // Portfolio / gallery filter
  const filterButtons = $$('.filter-btn'), items = $$('.portfolio-item');
  filterButtons.forEach(btn => btn.addEventListener('click', () => {
    filterButtons.forEach(b => {
      const on = b === btn;
      b.setAttribute('aria-pressed', on);
      b.classList.toggle('bg-brand-dark', on); b.classList.toggle('text-white', on);
      b.classList.toggle('bg-gray-100', !on); b.classList.toggle('text-gray-600', !on);
    });
    const f = btn.dataset.filter;
    items.forEach(i => { i.style.display = (f === 'all' || i.dataset.category === f) ? 'block' : 'none'; });
  }));

  // Gallery lightbox
  const lb = $('#lightbox');
  if (lb) {
    const img = $('#lb-img'), cap = $('#lb-cap');
    let current = 0, opener = null;
    const visible = () => $$('.gallery-open').filter(b => b.closest('.portfolio-item').style.display !== 'none');
    const show = i => {
      const list = visible();
      if (!list.length) return;
      current = (i + list.length) % list.length;
      img.src = list[current].dataset.full;
      img.alt = list[current].dataset.caption;
      cap.textContent = list[current].dataset.caption;
    };
    const open = btn => {
      opener = btn;
      lb.classList.remove('hidden'); lb.classList.add('flex');
      document.body.style.overflow = 'hidden';
      show(visible().indexOf(btn));
      $('#lb-close').focus();
    };
    const close = () => {
      lb.classList.add('hidden'); lb.classList.remove('flex');
      document.body.style.overflow = '';
      img.removeAttribute('src');
      if (opener) opener.focus();
    };
    $$('.gallery-open').forEach(b => b.addEventListener('click', () => open(b)));
    $('#lb-close').addEventListener('click', close);
    $('#lb-prev').addEventListener('click', () => show(current - 1));
    $('#lb-next').addEventListener('click', () => show(current + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (lb.classList.contains('hidden')) return;
      const rtl = document.documentElement.dir === 'rtl';
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(current + (rtl ? -1 : 1));
      if (e.key === 'ArrowLeft') show(current + (rtl ? 1 : -1));
    });
  }

  // Service links preselect the service in the form
  const serviceSel = $('#f-service');
  if (serviceSel) $$('.svc-link').forEach(a => a.addEventListener('click', () => { serviceSel.value = a.dataset.service; }));

  // Form: validate, then hand off to WhatsApp
  const form = $('#booking-form');
  if (form) {
    const fb = $('#form-feedback'), err = $('#form-error');
    const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    const todayStr = today.toISOString().slice(0, 10);
    $('#f-date').min = todayStr;

    const showError = msg => { err.textContent = msg; err.classList.remove('hidden'); };

    form.addEventListener('submit', e => {
      e.preventDefault();
      err.classList.add('hidden'); fb.classList.add('hidden');
      const v = Object.fromEntries(new FormData(form).entries());
      if (!v.name.trim() || !v.phone.trim() || !v.date || !v.emirate || !v.budget) return showError(M.err_req);
      if (v.phone.replace(/\D/g, '').length < 9) return showError(M.err_phone);
      if (v.date < todayStr) return showError(M.err_date);

      const lines = [M.wa_greet, '',
        `${M.m_name}: ${v.name.trim()}`, `${M.m_phone}: ${v.phone.trim()}`, `${M.m_date}: ${v.date}`,
        `${M.m_emirate}: ${v.emirate}`, `${M.m_budget}: ${v.budget}`];
      if (v.service) lines.push(`${M.m_service}: ${v.service}`);
      if (v.notes.trim()) lines.push(`${M.m_notes}: ${v.notes.trim()}`);

      window.open('https://wa.me/' + form.dataset.waNumber + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener,noreferrer');
      form.reset();
      fb.classList.remove('hidden');
      fb.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
})();
