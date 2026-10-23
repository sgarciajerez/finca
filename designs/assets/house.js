/* Living house controller. All artwork stays local; no dependency or endless background loop. */
(() => {
  'use strict';
  const scene = document.getElementById('house-scene');
  if (!scene) return;
  const pauseButton = document.getElementById('motion-toggle');
  const caption = document.getElementById('house-event-caption');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const events = {
    greeting: { duration: 4700, text: '¡Hola, vecino! Siempre hay alguien con una buena historia.' },
    lights: { duration: 3800, text: 'Una luz encendida. Un hogar que empieza a sentirse tuyo.' },
    cat: { duration: 3700, text: 'El vecino más curioso ya ha venido a conocerte.' },
    door: { duration: 3900, text: 'Toc, toc. Las buenas historias empiezan en la puerta.' },
    garden: { duration: 3200, text: 'Una pequeña brisa también forma parte de la casa.' },
    bird: { duration: 3600, text: 'A veces, basta con mirar un poco más arriba.' }
  };
  const timers = new Map();
  const lastPlayed = new Map();
  let paused = false;
  let autoTimer;
  let pointerFrame;
  let ambientIndex = 0;
  let lastAmbient = 0;
  const ambientEvents = ['greeting', 'bird', 'garden', 'cat', 'lights'];
  const reduced = () => media.matches || document.documentElement.dataset.reduceMotion === 'true';
  const clearEvents = () => {
    for (const timer of timers.values()) clearTimeout(timer);
    timers.clear();
    Object.keys(events).forEach(name => scene.classList.remove(`is-${name}`));
  };
  const resetPointer = () => { scene.style.setProperty('--pointer-x', '0'); scene.style.setProperty('--pointer-y', '0'); };
  function synchronizeMotion() {
    clearEvents();
    resetPointer();
    scene.dataset.static = String(reduced());
    scene.dataset.paused = String(paused);
    document.documentElement.dataset.scenePaused = String(paused);
    pauseButton.setAttribute('aria-pressed', String(paused));
    if (reduced()) {
      clearTimeout(autoTimer);
      clearEvents();
      resetPointer();
    }
  }
  function play(name, explicit = false) {
    if (!events[name] || document.hidden) return;
    // Hover never starts motion while paused or with a reduced-motion preference.
    if ((!explicit && (paused || reduced())) || timers.has(name)) return;
    const now = performance.now();
    if (!explicit && now - (lastPlayed.get(name) ?? -10000) < 6500) return;
    lastPlayed.set(name, now);
    scene.classList.add(`is-${name}`);
    caption.textContent = events[name].text;
    if (explicit && paused && !reduced()) {
      // A paused scene only changes its description; resume to replay movement.
      scene.classList.remove(`is-${name}`);
      caption.textContent = `${events[name].text} Animaciones pausadas.`;
      return;
    }
    timers.set(name, setTimeout(() => { scene.classList.remove(`is-${name}`); timers.delete(name); }, reduced() ? 4000 : events[name].duration));
  }
  scene.querySelectorAll('[data-house-event]').forEach(button => {
    button.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') play(button.dataset.houseEvent);
    });
    button.addEventListener('click', () => play(button.dataset.houseEvent, true));
  });
  scene.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    lastAmbient = performance.now();
    play('greeting');
  });
  scene.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || paused || reduced()) return;
    cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      const rect = scene.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2));
      const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2));
      scene.style.setProperty('--pointer-x', x.toFixed(3));
      scene.style.setProperty('--pointer-y', y.toFixed(3));
    });
    if (performance.now() - lastAmbient > 4200) {
      lastAmbient = performance.now();
      ambientIndex = (ambientIndex + 1) % ambientEvents.length;
      play(ambientEvents[ambientIndex]);
    }
  });
  scene.addEventListener('pointerleave', () => { cancelAnimationFrame(pointerFrame); resetPointer(); });
  // The hint is dismissible without moving the pointer or focus.
  scene.addEventListener('keydown', event => {
    if (event.key === 'Escape') scene.classList.add('hide-house-hints');
  });
  scene.addEventListener('focusin', () => scene.classList.remove('hide-house-hints'));
  scene.addEventListener('pointerover', () => scene.classList.remove('hide-house-hints'));
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    clearTimeout(autoTimer);
    clearEvents();
    resetPointer();
    synchronizeMotion();
    caption.textContent = paused ? 'Movimiento en pausa. Puedes seguir explorando los detalles.' : reduced() ? 'Movimiento reducido activo. Los detalles responden sin animación.' : 'La casa vuelve a tener vida. Prueba sus ventanas.';
  });
  media.addEventListener('change', synchronizeMotion);
  const observer = new MutationObserver(synchronizeMotion);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduce-motion'] });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { clearTimeout(autoTimer); clearEvents(); resetPointer(); }
  });
  synchronizeMotion();
  // One welcoming sequence under five seconds. Further surprises need user exploration.
  if (!reduced()) autoTimer = setTimeout(() => play('greeting'), 1000);
  window.addEventListener('pagehide', () => { clearTimeout(autoTimer); clearEvents(); cancelAnimationFrame(pointerFrame); observer.disconnect(); }, { once: true });
})();
