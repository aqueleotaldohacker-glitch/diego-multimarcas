(() => {
  'use strict';
  const venue = [-29.4494626, -52.0032076];
  const section = document.getElementById('visite');
  if (!section) return;
  const stage = document.getElementById('visit-stage');
  const photo = document.getElementById('visit-photo');
  const mapElement = document.getElementById('visit-map');
  const play = document.getElementById('visit-play');
  const label = document.getElementById('visit-label');
  const status = document.getElementById('visit-status');
  const progress = document.getElementById('visit-progress');
  const tabs = [...section.querySelectorAll('[data-visit-view]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let map, marker, timers = [], running = false, frame, startedAt = 0, successfulTiles = 0, tileErrors = 0, loadTimer;
  function showStatus(message) { status.textContent = message; }
  function stop() {
    timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(frame); map?.stop(); running = false;
    play.innerHTML = '<span aria-hidden="true">▶</span> Ver aproximação <small>12s</small>';
    play.setAttribute('aria-label', 'Reproduzir aproximação pelo mapa até a fachada');
    play.setAttribute('aria-pressed', 'false'); stage.classList.remove('playing'); photo.style.transform = '';
  }
  function mapFailed() {
    if (successfulTiles > 0) return;
    stop(); setView('facade'); showStatus('O mapa não carregou. Veja a fachada ou abra a localização no Google Maps.');
  }
  function initMap() {
    if (location.protocol === 'file:' || !navigator.onLine || !window.L) {
      showStatus('O mapa precisa de internet e da versão no navegador. A fachada continua disponível; você também pode abrir o Google Maps.');
      return false;
    }
    if (map) { map.invalidateSize(); return true; }
    map = L.map(mapElement, { scrollWheelZoom: false, zoomControl: true, attributionControl: true, minZoom: 10, maxZoom: 19 }).setView(venue, 16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors' }).addTo(map)
      .on('tileload', () => { successfulTiles++; clearTimeout(loadTimer); stage.classList.add('map-loaded'); })
      .on('tileerror', () => { tileErrors++; if (tileErrors >= 8) mapFailed(); });
    marker = L.marker(venue, { icon: L.divIcon({ className: 'diego-map-marker', html: '<span class="map-pin"><img src="assets/logo-original.png" alt=""></span>', iconSize: [58, 67], iconAnchor: [29, 65] }), title: 'Diego Multimarcas, Rua João Aleixo Hennemann, 31' }).addTo(map);
    marker.bindTooltip('DIEGO MULTIMARCAS', { permanent: true, direction: 'bottom', offset: [0, 5], className: 'diego-map-label' });
    loadTimer = setTimeout(mapFailed, 9000);
    map.on('dragstart', stop);
    return true;
  }
  function setView(view) {
    stage.dataset.view = view;
    const isMap = view === 'map';
    photo.setAttribute('aria-hidden', String(isMap)); mapElement.setAttribute('aria-hidden', String(!isMap));
    mapElement.inert = !isMap;
    tabs.forEach(tab => { const selected = tab.dataset.visitView === view; tab.setAttribute('aria-pressed', String(selected)); tab.classList.toggle('active', selected); });
    if (isMap) {
      if (!initMap()) { stage.dataset.view = 'facade'; photo.setAttribute('aria-hidden', 'false'); mapElement.setAttribute('aria-hidden', 'true'); mapElement.inert = true; tabs.forEach(tab => { const selected = tab.dataset.visitView === 'facade'; tab.setAttribute('aria-pressed', String(selected)); tab.classList.toggle('active', selected); }); return false; }
      requestAnimationFrame(() => map.invalidateSize());
      label.textContent = 'UM PONTO CERTO EM LAJEADO';
    } else label.textContent = 'CHEGOU. ESSA É A NOSSA CASA.';
    return true;
  }
  tabs.forEach(tab => tab.addEventListener('click', () => { stop(); showStatus(''); progress.style.width = '0%'; setView(tab.dataset.visitView); }));
  function schedule(fn, milliseconds) { timers.push(setTimeout(fn, milliseconds)); }
  function tick(now) {
    if (!running) return;
    const elapsed = now - startedAt;
    progress.style.width = `${Math.min(100, elapsed / 120)}%`;
    if (elapsed > 8700 && !reduced.matches) photo.style.transform = `scale(${1 + Math.min(1, (elapsed - 8700) / 3300) * .045})`;
    frame = requestAnimationFrame(tick);
  }
  play.addEventListener('click', () => {
    if (running) { stop(); showStatus('Visita interrompida. Explore o mapa ou veja a fachada.'); return; }
    showStatus('');
    if (reduced.matches) { setView('map'); showStatus('Movimento reduzido ativo: explore o mapa e a fachada pelos botões acima.'); return; }
    if (!setView('map')) return;
    running = true; stage.classList.add('playing'); play.setAttribute('aria-pressed', 'true'); play.setAttribute('aria-label', 'Parar visita animada');
    play.innerHTML = '<span aria-hidden="true">■</span> Parar visita';
    startedAt = performance.now(); frame = requestAnimationFrame(tick);
    map.setView(venue, 13, { animate: false }); label.textContent = '01 / LAJEADO, RIO GRANDE DO SUL';
    schedule(() => { map.flyTo(venue, 17, { duration: 5.1, easeLinearity: .2 }); label.textContent = '02 / MOINHOS D’ÁGUA'; }, 450);
    schedule(() => { map.flyTo(venue, 19, { duration: 2.4 }); label.textContent = '03 / RUA JOÃO ALEIXO HENNEMANN, 31'; }, 5750);
    schedule(() => { setView('facade'); }, 8700);
    schedule(() => { stop(); progress.style.width = '100%'; showStatus('Você já conhece a fachada. Toque em “Traçar minha rota” para sair da sua localização até a loja.'); }, 12000);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && running) stop(); });
  window.addEventListener('offline', () => { if (running || stage.dataset.view === 'map') { stop(); setView('facade'); showStatus('Sem conexão. A foto da fachada continua disponível.'); } });
  reduced.addEventListener('change', () => { if (reduced.matches && running) stop(); });
})();
