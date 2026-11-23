(() => {
  'use strict';

  const deck = document.querySelector('#recorrido');
  const slides = [...deck.querySelectorAll('.slide')];
  const progress = document.querySelector('#progress');
  const indexList = document.querySelector('#index-list');
  const indexDialog = document.querySelector('#index-dialog');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const pad = (number) => String(number).padStart(2, '0');
  let current = -1;
  let frame = 0;
  let wheelLockedUntil = 0;
  let wheelLast = 0;

  for (const [i, slide] of slides.entries()) {
    const marker = document.createElement('a');
    marker.href = '#' + slide.id;
    marker.title = slide.dataset.name;
    marker.setAttribute('aria-label', 'Ir a ' + slide.dataset.name);
    progress.append(marker);

    const entry = marker.cloneNode(false);
    const position = document.createElement('span');
    position.textContent = pad(i + 1);
    entry.append(position, slide.dataset.name);
    indexList.append(entry);
  }

  function slideFromHash(hash) {
    return slides.findIndex((slide) => '#' + slide.id === hash);
  }

  function updateSection(index) {
    if (index === current) return;
    const slide = slides[index];
    if (current >= 0) slide.dataset.arrival = index > current ? 'forward' : 'backward';
    current = index;
    document.body.dataset.section = slide.id;
    document.body.classList.toggle('light-ui', slide.dataset.tone === 'light');
    document.querySelector('#current-number').textContent = pad(index + 1);
    document.querySelector('#current-name').textContent = slide.dataset.name;
    slides.forEach((item) => item.classList.toggle('is-active', item === slide));
    document.querySelectorAll('.head-nav a, #progress a, #index-list a').forEach((link) => {
      if (link.hash === '#' + slide.id) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  }

  function visibleSection() {
    const middle = deck.scrollTop + deck.clientHeight / 2;
    const index = slides.findIndex((slide) => slide.offsetTop + slide.offsetHeight > middle);
    return index < 0 ? slides.length - 1 : index;
  }

  function setHash(index) {
    const hash = '#' + slides[index].id;
    if (location.hash === hash || (!location.hash && index === 0)) return;
    try { history.replaceState(null, '', hash); } catch { /* Local viewers can disable history. */ }
  }

  function goTo(index, { instant = false, focus = false } = {}) {
    const slide = slides[index];
    if (!slide) return;
    const behavior = instant || reducedMotion.matches ? 'instant' : 'smooth';
    deck.scrollTo({ top: slide.offsetTop, behavior });
    if (focus) slide.querySelector('h1,h2').focus({ preventScroll: true });
    if (behavior === 'instant') updateSection(index);
    setHash(index);
  }

  function handleScroll() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      updateSection(visibleSection());
    });
  }
  deck.addEventListener('scroll', handleScroll, { passive: true });
  deck.addEventListener('scrollend', () => setHash(visibleSection()));

  function navigate(event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const next = slideFromHash(link.hash);
    if (next < 0) return;
    event.preventDefault();
    if (indexDialog.open) indexDialog.close();
    goTo(next, { focus: true });
  }
  document.addEventListener('click', navigate);
  window.addEventListener('hashchange', () => goTo(Math.max(0, slideFromHash(location.hash))));

  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey ||
        document.querySelector('dialog[open]') || event.target.closest('textarea,select,input:not([type="checkbox"]),[contenteditable="true"]')) return;
    const destinations = { ArrowDown: current + 1, PageDown: current + 1, ArrowUp: current - 1, PageUp: current - 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    if (!event.repeat) goTo(destinations[event.key], { focus: true });
  });

  // Native touch scrolling keeps taller slides fully readable. A wheel gesture advances one chapter.
  deck.addEventListener('wheel', (event) => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
    const now = performance.now();
    const elapsed = now - wheelLast;
    wheelLast = now;
    if (now < wheelLockedUntil) {
      event.preventDefault();
      if (elapsed < 110) wheelLockedUntil = Math.max(wheelLockedUntil, now + 130);
      return;
    }
    const slide = slides[visibleSection()];
    const direction = Math.sign(event.deltaY);
    const atBottom = deck.scrollTop + deck.clientHeight >= slide.offsetTop + slide.offsetHeight - 2;
    const atTop = deck.scrollTop <= slide.offsetTop + 2;
    if ((direction > 0 && !atBottom) || (direction < 0 && !atTop)) return;
    const next = slides.indexOf(slide) + direction;
    if (!slides[next]) return;
    event.preventDefault();
    if (Math.abs(event.deltaY) < 2 && event.deltaMode === 0) return;
    wheelLockedUntil = now + (reducedMotion.matches ? 150 : 700);
    goTo(next);
  }, { passive: false });

  const indexButton = document.querySelector('#open-index');
  indexButton.addEventListener('click', () => indexDialog.showModal());
  document.querySelector('#credits').addEventListener('click', () => document.querySelector('#credit-dialog').showModal());
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.querySelector('.close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const { top, left, bottom, right } = dialog.getBoundingClientRect();
      if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close();
    });
  });

  const fullscreen = document.querySelector('#fullscreen');
  fullscreen.hidden = !document.fullscreenEnabled;
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      fullscreen.hidden = true;
    }
  });
  document.addEventListener('fullscreenchange', () => {
    const label = document.fullscreenElement ? 'Salir de pantalla completa' : 'Pantalla completa';
    fullscreen.title = label;
    fullscreen.querySelector('span').textContent = label;
    fullscreen.setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
  });

  const screens = {
    acceso: { name: 'Acceso', alt: 'Portal de Aura Spa con los campos de acceso vacíos.', detail: 'El portal abre la interfaz que corresponde al rol de la cuenta. El cliente también puede registrarse aquí.' },
    citas: { name: 'Reservas', alt: 'Pantalla de reservas con el especialista y las horas disponibles.', detail: 'Elige la fecha y revisa las horas libres antes de confirmar la cita.' },
    tienda: { name: 'Tienda', alt: 'Catálogo de una sede con aceites, sales de baño y botones para añadirlos al carrito.', detail: 'Cada sede muestra sus productos y precios. El cliente añade artículos al carrito y paga al recibir el pedido.' },
  };
  let screen = 'citas';
  const screenImage = document.querySelector('#screen-img');
  const enlarge = document.querySelector('#enlarge');
  function animate(element) {
    element.classList.remove('changing');
    void element.offsetWidth;
    element.classList.add('changing');
  }
  document.querySelectorAll('[data-screen]').forEach((button) => button.addEventListener('click', () => {
    screen = button.dataset.screen;
    const info = screens[screen];
    screenImage.src = 'assets/' + screen + '.png';
    screenImage.alt = info.alt;
    enlarge.setAttribute('aria-label', 'Ampliar captura de ' + info.name.toLowerCase());
    document.querySelector('#screen-detail').textContent = info.detail;
    document.querySelectorAll('[data-screen]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    animate(screenImage);
  }));
  function showCapture() {
    const img = document.querySelector('#zoom-img');
    img.src = screenImage.src;
    img.alt = screenImage.alt;
    document.querySelector('#zoom-title').textContent = screens[screen].name;
    document.querySelector('#screen-dialog').showModal();
  }
  enlarge.addEventListener('click', showCapture);
  document.querySelector('#zoom-caption').addEventListener('click', showCapture);

  const durations = [...document.querySelectorAll('[data-duration]')];
  const specialist = document.querySelector('#specialist');
  let minutes = 60;
  function clock(minutesFromMidnight) {
    return pad(Math.floor(minutesFromMidnight / 60)) + ':' + pad(minutesFromMidnight % 60);
  }
  function renderSlots() {
    const slots = document.querySelector('#slots');
    slots.replaceChildren();
    const end = 12 * 60;
    if (specialist.checked) {
      for (let start = 8 * 60; start + minutes <= end; start += minutes) {
        const slot = document.createElement('span');
        slot.textContent = clock(start) + ' – ' + clock(start + minutes);
        slots.append(slot);
      }
    }
    const count = slots.childElementCount;
    document.querySelector('#slot-count').textContent = count + ' citas disponibles';
    if (!count) slots.textContent = 'Este turno necesita un especialista asignado para ofrecer citas.';
    animate(slots);
  }
  durations.forEach((button) => button.addEventListener('click', () => {
    minutes = Number(button.dataset.duration);
    durations.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    renderSlots();
  }));
  specialist.addEventListener('change', renderSlots);
  renderSlots();

  const roles = [...document.querySelectorAll('.roles-list details')];
  roles.forEach((item) => item.addEventListener('toggle', () => {
    if (item.open) roles.filter((other) => other !== item).forEach((other) => { other.open = false; });
  }));
  const initial = Math.max(0, slideFromHash(location.hash));
  updateSection(initial);
  goTo(initial, { instant: true });
})();
