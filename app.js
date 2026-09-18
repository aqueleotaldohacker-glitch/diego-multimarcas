(() => {
  'use strict';
  const icons = {
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    whatsapp: '<path d="M21 11.6a9 9 0 0 1-13.3 8L3 21l1.4-4.6A9 9 0 1 1 21 11.6Z"/><path d="M8 7.5c-.6 0-1 1-1 1.6 0 2.8 4.2 7 7.3 7 .8 0 1.8-1 1.8-1.5l-2.7-1.4-.9 1c-1.4-.5-3.3-2.3-3.7-3.6l1-1L8.7 7.5Z"/>',
    search: '<circle cx="10.7" cy="10.7" r="6.8"/><path d="m16 16 5 5"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    shield: '<path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6Z"/><path d="m8 12 3 3 5-6"/>',
    truck: '<path d="M2 15V6h12v9M14 9h4l4 5v4h-3M2 15v3h2m5 0h5m0-3v3h1M18 9v5h4"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17" cy="18" r="2.5"/>',
    handshake: '<path d="m2 8 4-4 4 2 4-2 8 5-4 7-5 5-4-2-4-4Zm4-4 4 2-3 4 3 2 4-3 6 5M5 15l4-4m0 8 4-4m0 6 4-5"/>',
    key: '<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-5-5 3-3m0 6 3-3"/><circle cx="7" cy="7" r="1"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',
    gauge: '<path d="M4.2 19a10 10 0 1 1 15.6 0H4.2Z"/><path d="m12 13 4-5M5 13h1m12 0h1M8 6l1 1"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || ''}</svg>`;
  const hydrateIcons = (root = document) => root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  const cars = window.DIEGO_CARS || [];
  const wa = message => `https://wa.me/${window.DIEGO_CONTACT}?text=${encodeURIComponent(message)}`;
  const setupLinks = (root = document) => root.querySelectorAll('[data-whatsapp]').forEach(el => { el.href = wa(el.dataset.whatsapp); el.target = '_blank'; el.rel = 'noopener noreferrer'; });
  const grid = document.getElementById('vehicle-grid');
  const search = document.getElementById('vehicle-search');
  const colorFilter = document.getElementById('color-filter');
  const storageKey = 'diego-multimarcas:favorites:v1';
  let favorites = new Set();
  try { const saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(saved)) favorites = new Set(saved.filter(id => cars.some(car => car.id === id))); } catch (_) { /* Local storage is optional. */ }
  let activeFilter = 'all';
  let toastTimer;
  let lastFocused;
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function toast(message) { const el = document.getElementById('toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 2600); }
  function renderCars() {
    const query = normalize(search.value.trim());
    const visible = cars.filter(car => (activeFilter !== 'favorites' || favorites.has(car.id)) && (colorFilter.value === 'all' || car.color === colorFilter.value) && normalize(`${car.name} ${car.color}`).includes(query));
    grid.innerHTML = visible.map(car => `<article class="vehicle-card"><div class="vehicle-image"><div class="vehicle-photo crop-${car.crop}" role="img" aria-label="${escape(car.name)} ${escape(car.color.toLowerCase())}, imagem de referência da loja"></div><button class="image-open" data-detail="${car.id}" aria-label="Conhecer ${escape(car.name)} ${escape(car.color)}"></button><span class="photo-badge">SELEÇÃO DIEGO</span><button class="favorite-button" data-favorite="${car.id}" aria-label="${favorites.has(car.id) ? 'Remover dos favoritos:' : 'Salvar nos favoritos:'} Hilux ${escape(car.color)}" aria-pressed="${favorites.has(car.id)}">${icon('heart')}</button></div><div class="vehicle-info"><div class="vehicle-make"><span>TOYOTA</span><span><i class="color-dot" style="background:${({Cinza:'#92968e',Vermelha:'#9e3831',Preta:'#292c27',Branca:'#fafaf3'})[car.color]}"></i>${escape(car.color.toUpperCase())}</span></div><h3>Hilux</h3><p class="vehicle-subtitle">${escape(car.subtitle)}</p><div class="vehicle-specs"><span>${icon('calendar')} Ano sob consulta</span><span>${icon('gauge')} Km a confirmar</span></div><div class="vehicle-price"><div><small>Vamos conversar?</small><strong>Valor sob consulta</strong></div><button class="detail-button" data-detail="${car.id}" aria-label="Ver detalhes da Hilux ${escape(car.color)}">↗</button></div></div></article>`).join('');
    document.getElementById('result-count').textContent = `${visible.length} ${visible.length === 1 ? 'caminhonete para conhecer' : 'caminhonetes para conhecer'}`;
    document.getElementById('favorites-count').textContent = favorites.size;
    document.getElementById('empty-state').hidden = visible.length > 0;
    document.getElementById('empty-message').textContent = activeFilter === 'favorites' && favorites.size === 0 ? 'Toque no coração das caminhonetes para reunir suas favoritas aqui.' : 'Tente outra cor ou limpe os filtros para explorar a seleção.';
  }
  function toggleFavorite(id) {
    if (favorites.has(id)) { favorites.delete(id); toast('Hilux removida dos favoritos.'); } else { favorites.add(id); toast('Hilux salva nos seus favoritos.'); }
    try { localStorage.setItem(storageKey, JSON.stringify([...favorites])); } catch (_) { /* Keep session favorites if persistence is blocked. */ }
    renderCars();
    document.querySelectorAll(`[data-favorite="${id}"]`).forEach(el => { el.setAttribute('aria-pressed', String(favorites.has(id))); el.setAttribute('aria-label', `${favorites.has(id) ? 'Remover dos favoritos:' : 'Salvar nos favoritos:'} ${cars.find(c => c.id === id).name}`); });
  }
  function openDialog(dialog) { lastFocused = document.activeElement; dialog.showModal(); document.body.classList.add('modal-open'); }
  function openVehicle(id, updateHash = true) {
    const car = cars.find(item => item.id === id); if (!car) return;
    const dialog = document.getElementById('vehicle-dialog');
    const message = `Olá, Diego! Vi a Toyota Hilux ${car.color.toLowerCase()} na seleção do site e gostaria de confirmar disponibilidade, ano, versão, quilometragem e valor.`;
    document.getElementById('vehicle-detail').innerHTML = `<div class="detail-layout"><div class="detail-photo-wrap"><div class="detail-photo crop-${car.crop}" role="img" aria-label="Toyota Hilux ${escape(car.color)}, referência visual do Instagram"></div><p class="detail-photo-note">FOTOGRAFIA DE REFERÊNCIA · INSTAGRAM DIEGO MULTIMARCAS</p></div><div class="detail-content"><div class="eyebrow"><span></span> SELEÇÃO DIEGO MULTIMARCAS</div><span class="small-label">TOYOTA / ${escape(car.color.toUpperCase())}</span><h2 id="vehicle-title">Hilux <em>${escape(car.color.toLowerCase())}.</em></h2><p>${escape(car.description)}</p><dl class="detail-specs"><div><dt>Cor na referência</dt><dd>${escape(car.color)}</dd></div><div><dt>Ano / modelo</dt><dd>Sob consulta</dd></div><div><dt>Quilometragem</dt><dd>A confirmar</dd></div><div><dt>Versão e motorização</dt><dd>Sob consulta</dd></div></dl><span class="small-label">SUA PRÓXIMA CONQUISTA</span><strong class="detail-price">Valor sob consulta</strong><a class="button button-dark" href="${wa(message)}" target="_blank" rel="noopener noreferrer">${icon('whatsapp')} Tenho interesse nesta Hilux <span>↗</span></a><p class="detail-caption">Consulte a disponibilidade e a ficha completa com o Diego.</p><a class="detail-source" href="${car.source}" target="_blank" rel="noopener noreferrer">Conhecer o Instagram da loja ↗</a></div></div>`;
    if (!dialog.open) openDialog(dialog);
    if (updateHash) history.replaceState(null, '', `#veiculo/${car.id}`);
  }
  grid.addEventListener('click', event => {
    const favorite = event.target.closest('[data-favorite]');
    if (favorite) { const id = favorite.dataset.favorite; toggleFavorite(id); const focusTarget = grid.querySelector(`[data-favorite="${id}"]`) || grid.querySelector('[data-favorite]') || document.querySelector('[data-filter="favorites"]'); focusTarget.focus({preventScroll:true}); return; }
    const detail = event.target.closest('[data-detail]'); if (detail) openVehicle(detail.dataset.detail);
  });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { activeFilter = button.dataset.filter; document.querySelectorAll('[data-filter]').forEach(tab => { tab.classList.toggle('active', tab === button); tab.setAttribute('aria-pressed', String(tab === button)); }); renderCars(); }));
  search.addEventListener('input', renderCars); colorFilter.addEventListener('change', renderCars);
  document.getElementById('reset-filters').addEventListener('click', () => { search.value = ''; colorFilter.value = 'all'; document.querySelector('[data-filter="all"]').click(); });
  const menuToggle = document.getElementById('menu-toggle');
  const navigation = document.getElementById('navigation');
  const closeMenu = () => { navigation.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Abrir menu'); };
  menuToggle.addEventListener('click', () => { const opened = navigation.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', String(opened)); menuToggle.setAttribute('aria-label', opened ? 'Fechar menu' : 'Abrir menu'); });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { const bounds = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close(); });
    dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); if (dialog.id === 'vehicle-dialog' && location.hash.startsWith('#veiculo/')) history.replaceState(null, '', '#estoque'); if (lastFocused?.isConnected) lastFocused.focus({preventScroll:true}); });
  });
  document.getElementById('open-interest').addEventListener('click', () => openDialog(document.getElementById('interest-dialog')));
  document.getElementById('open-about-prototype').addEventListener('click', () => openDialog(document.getElementById('prototype-dialog')));
  document.getElementById('interest-form').addEventListener('submit', event => {
    event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
    const data = new FormData(form); const name = data.get('name').trim(); const vehicle = data.get('vehicle').trim();
    if (!name || !vehicle) { toast('Preencha seu nome e a Hilux que você procura.'); return; }
    const message = `Olá, Diego! Meu nome é ${name}.\n\nEstou procurando: ${vehicle}.\nComo penso em negociar: ${data.get('payment')}.${data.get('message').trim() ? `\nMais detalhes: ${data.get('message').trim()}` : ''}\n\nVim pelo site da Diego Multimarcas.`;
    const link = document.createElement('a'); link.href = wa(message); link.target = '_blank'; link.rel = 'noopener noreferrer'; link.click();
    toast('Mensagem preparada. Continue no WhatsApp para enviar.');
  });
  function handleHash() { if (location.hash.startsWith('#veiculo/')) openVehicle(location.hash.slice(9), false); else if (document.getElementById('vehicle-dialog').open) document.getElementById('vehicle-dialog').close(); }
  window.addEventListener('hashchange', handleHash);
  document.getElementById('year').textContent = new Date().getFullYear();
  hydrateIcons(); setupLinks(); renderCars(); handleHash();
})();
