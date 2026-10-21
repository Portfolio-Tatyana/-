(() => {
  const works = window.WORKS || [];
  const $ = (selector, root = document) => root.querySelector(selector);
  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const grid = $('#works-grid'), filters = $('#works-filters'), result = $('#works-result');
  const dialog = $('#work-dialog'), roomFilters = $('#room-filters'), photoGrid = $('#work-photo-grid');
  const viewer = $('#photo-viewer'), viewerImage = $('#viewer-image'), viewerCaption = $('#viewer-caption');
  let activeWork = null, activeRoom = 'Все комнаты', shownPhotos = [], viewerIndex = 0, returnFocus = null;
  $('#year').textContent = new Date().getFullYear();
  $('#works-photo-total').textContent = works.reduce((sum, p) => sum + p.photoCount, 0);

  const categories = [...new Set(works.flatMap(p => p.rooms))];
  const drawRoomFilters = (selected = 'Все комнаты') => {
    const counts = new Map();
    works.forEach(p => p.rooms.forEach(room => counts.set(room, (counts.get(room) || 0) + 1)));
    filters.innerHTML = ['Все комнаты', ...categories].map(room => `<button class="filter-chip ${selected === room ? 'is-active' : ''}" type="button" data-room="${safe(room)}" aria-pressed="${selected === room}">${safe(room)}<span>${room === 'Все комнаты' ? works.length : counts.get(room)}</span></button>`).join('');
    filters.querySelectorAll('button').forEach(button => button.addEventListener('click', () => drawRoomFilters(button.dataset.room)));
    const visible = selected === 'Все комнаты' ? works : works.filter(p => p.rooms.includes(selected));
    result.textContent = `${visible.length} ${visible.length === 1 ? 'проект' : visible.length >= 2 && visible.length <= 4 ? 'проекта' : 'проектов'}`;
    renderWorks(visible);
  };

  function renderWorks(list) {
    grid.innerHTML = list.map((p, i) => `<button class="works-card" type="button" data-open-work="${safe(p.slug)}"><span class="works-card-photo"><img src="${safe(p.cover)}" alt="${safe(p.title)} — ${safe(p.subtitle)}" loading="lazy"><span class="works-card-arrow" aria-hidden="true">↗</span><span class="works-card-index">${String(works.indexOf(p) + 1).padStart(2,'0')}</span></span><span class="works-card-copy"><span class="works-card-kicker">${safe(p.subtitle)}</span><span class="works-card-title">${safe(p.title)}</span><span class="works-card-summary">${safe(p.summary)}</span><span class="works-card-meta">${p.photoCount} фото <i>·</i> ${safe(p.rooms.slice(0, 3).join(' · '))}</span></span></button>`).join('');
    grid.querySelectorAll('[data-open-work]').forEach(button => button.addEventListener('click', () => openWork(works.find(p => p.slug === button.dataset.openWork), button)));
  }

  function openWork(work, opener) {
    if (!work) return;
    activeWork = work; activeRoom = 'Все комнаты'; returnFocus = opener;
    $('#dialog-kicker').textContent = `${work.subtitle} · ${work.photoCount} фотографий`;
    $('#dialog-title').textContent = work.title;
    $('#dialog-summary').textContent = work.summary;
    renderProjectPhotos();
    dialog.showModal(); document.body.classList.add('dialog-open');
    $('.work-dialog-close').focus();
    history.replaceState(null, '', `#${work.slug}`);
  }

  function renderProjectPhotos() {
    if (!activeWork) return;
    const groups = activeWork.photoCategories;
    const roomNames = ['Все комнаты', ...Object.keys(groups)];
    roomFilters.innerHTML = roomNames.map(room => {
      const count = room === 'Все комнаты' ? activeWork.photoCount : groups[room].length;
      return `<button class="room-chip ${activeRoom === room ? 'is-active' : ''}" type="button" data-room="${safe(room)}" aria-pressed="${activeRoom === room}">${safe(room)} <span>${count}</span></button>`;
    }).join('');
    roomFilters.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { activeRoom = button.dataset.room; renderProjectPhotos(); }));
    shownPhotos = (activeRoom === 'Все комнаты' ? Object.entries(groups).flatMap(([room, images]) => images.map(src => ({room, src}))) : (groups[activeRoom] || []).map(src => ({room:activeRoom, src})));
    $('#room-result').textContent = `${shownPhotos.length} ${shownPhotos.length === 1 ? 'фотография' : shownPhotos.length >= 2 && shownPhotos.length <= 4 ? 'фотографии' : 'фотографий'}`;
    photoGrid.innerHTML = shownPhotos.map((photo, i) => `<button class="work-photo" type="button" data-photo-index="${i}" aria-label="Открыть: ${safe(photo.room)}, фото ${i + 1}"><img src="${safe(photo.src)}" alt="${safe(activeWork.title)} — ${safe(photo.room)}" loading="lazy" decoding="async"><span>${safe(photo.room)}</span></button>`).join('');
    photoGrid.querySelectorAll('[data-photo-index]').forEach(button => button.addEventListener('click', () => openViewer(Number(button.dataset.photoIndex))));
  }

  function openViewer(index) {
    viewerIndex = index; updateViewer(); viewer.hidden = false; document.body.classList.add('viewer-open'); $('.viewer-close').focus();
  }
  function updateViewer() {
    const photo = shownPhotos[viewerIndex]; if (!photo) return;
    viewerImage.src = photo.src; viewerImage.alt = `${activeWork.title} — ${photo.room}`;
    viewerCaption.textContent = `${activeWork.title} · ${photo.room} · ${String(viewerIndex + 1).padStart(2,'0')} / ${String(shownPhotos.length).padStart(2,'0')}`;
  }
  function moveViewer(step) { viewerIndex = (viewerIndex + step + shownPhotos.length) % shownPhotos.length; updateViewer(); }
  function closeViewer() { viewer.hidden = true; document.body.classList.remove('viewer-open'); viewerImage.removeAttribute('src'); }
  $('.viewer-close').addEventListener('click', closeViewer);
  $('.viewer-prev').addEventListener('click', () => moveViewer(-1));
  $('.viewer-next').addEventListener('click', () => moveViewer(1));
  viewer.addEventListener('click', event => { if (event.target === viewer) closeViewer(); });
  $('.work-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { closeViewer(); document.body.classList.remove('dialog-open'); returnFocus?.focus(); });
  document.addEventListener('keydown', event => {
    if (!viewer.hidden && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) { event.preventDefault(); moveViewer(event.key === 'ArrowRight' ? 1 : -1); }
    else if (event.key === 'Escape' && !viewer.hidden) { event.stopPropagation(); closeViewer(); }
  });
  drawRoomFilters();
  const requested = location.hash.slice(1);
  if (requested) { const target = works.find(p => p.slug === requested); if (target) openWork(target, document.activeElement); }
})();
