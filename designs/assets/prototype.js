/* FINCA visual prototype. Deterministic examples only: no AI, network or portal access. */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const choiceValue = (id) => document.querySelector(`#${id} input:checked`)?.value;
  const setChoice = (id, value) => document.querySelectorAll(`#${id} input[type=radio]`).forEach(input => { input.checked = input.value === value; });
  const keys = { property: 'finca.design.property', text: 'finca.design.text', drafts: 'finca.design.drafts', preferences: 'finca.design.preferences' };
  const defaults = { operation: 'venta', type: 'piso', city: 'Sevilla', price: 285000, area: 92, rooms: 3, baths: 2, condition: 'buen estado', extras: ['Terraza', 'Ascensor'], notes: '' };
  let toastTimer;
  function announce(message) {
    const region = $('#toast');
    if (!region) return;
    clearTimeout(toastTimer);
    region.textContent = message;
    toastTimer = setTimeout(() => { region.textContent = ''; }, 6500);
  }
  function read(key, fallback) {
    try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
    catch { announce('No se pudieron recuperar los datos locales. Puedes continuar con el ejemplo.'); return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { announce('No se ha podido guardar. El almacenamiento del navegador no está disponible o está lleno. Conserva una copia del texto.'); return false; }
  }
  function getProperty() {
    const value = read(keys.property, defaults);
    return value && typeof value === 'object' && !Array.isArray(value) ? { ...defaults, ...value, extras: Array.isArray(value.extras) ? value.extras : [] } : { ...defaults };
  }
  function getDrafts() { const drafts = read(keys.drafts, []); return Array.isArray(drafts) ? drafts.filter(d => d && typeof d.id === 'string' && typeof d.name === 'string' && typeof d.text === 'string' && d.property) : []; }
  const preferences = read(keys.preferences, {}) || {};
  document.documentElement.dataset.reduceMotion = String(preferences.reduceMotion === true);
  const formatter = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });
  function capital(value) { return value.charAt(0).toUpperCase() + value.slice(1); }
  function describe(property, tone = 'profesional', length = 'estandar') {
    const type = capital(String(property.type));
    const features = property.extras.length ? ` Entre sus características confirmadas: ${property.extras.map(v => String(v).toLowerCase()).join(', ')}.` : '';
    const intro = tone === 'cercano' ? 'Tu próximo espacio empieza aquí. ' : tone === 'exclusivo' ? 'Un espacio para vivir a tu manera. ' : '';
    const basic = `${type} en ${property.operation} en ${property.city}, con ${formatter.format(property.area)} m², ${property.rooms} habitaciones y ${property.baths} baños.`;
    const price = `Precio de ${property.operation}: ${formatter.format(property.price)} €${property.operation === 'alquiler' ? ' al mes' : ''}.`;
    if (length === 'breve') return `${intro}${basic}${features}\n\n${price}`;
    const condition = ({ 'buen estado': 'La vivienda se encuentra en buen estado.', reformado: 'La vivienda está reformada.', 'a reformar': 'La vivienda necesita una reforma.' })[property.condition] || '';
    return `${intro}${basic}\n\n${condition}${features}\n\n${price}\n\nContacta para conocer más detalles y concertar una visita.`.replace(/\n{3,}/g, '\n\n');
  }
  function summarize(property) {
    document.querySelectorAll('[data-property-title]').forEach(el => { el.textContent = `${capital(String(property.type))} en ${property.city}`; });
    document.querySelectorAll('[data-property-meta]').forEach(el => { el.textContent = `${formatter.format(property.area)} m² · ${property.rooms} hab. · ${property.baths} baños`; });
  }
  const editor = $('#ad-text');
  let baseText = '';
  function countWords() {
    if ($('#word-count') && editor) $('#word-count').textContent = `${editor.value.trim() ? editor.value.trim().split(/\s+/).length : 0} palabras`;
  }
  function setEditor(text) { if (editor) { editor.value = text; baseText = text; countWords(); } }
  if ($('#tone')) setChoice('tone', preferences.tone || 'profesional');
  if ($('#length')) setChoice('length', preferences.length || 'estandar');
  if (editor && !$('#demo-preview')) {
    const stored = read(keys.text, null);
    setEditor(typeof stored === 'string' ? stored : describe(getProperty(), choiceValue('tone'), choiceValue('length')));
    summarize(getProperty());
  }
  editor?.addEventListener('input', countWords);
  const propertyForm = $('#property-form');
  if (propertyForm) {
    const property = getProperty();
    ['operation', 'type', 'city', 'price', 'area', 'rooms', 'baths', 'condition', 'notes'].forEach(name => { if (propertyForm.elements[name]) propertyForm.elements[name].value = property[name]; });
    propertyForm.querySelectorAll('[name=extras]').forEach(input => { input.checked = property.extras.includes(input.value); });
    propertyForm.addEventListener('submit', (event) => {
      event.preventDefault();
      propertyForm.querySelectorAll('[aria-invalid]').forEach(input => { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); });
      propertyForm.querySelectorAll('.field-error').forEach(el => el.remove());
      const invalid = [...propertyForm.elements].filter(el => el.willValidate && !el.checkValidity());
      const errorBox = $('#form-errors');
      errorBox.replaceChildren();
      if (invalid.length) {
        const title = document.createElement('div');
        const strong = document.createElement('strong'); strong.textContent = 'Revisa los datos para continuar.'; title.append(strong);
        invalid.forEach(input => {
          input.setAttribute('aria-invalid', 'true');
          const error = document.createElement('p'); error.className = 'field-error'; error.id = `${input.id}-error`;
          error.textContent = input.validity.valueMissing ? 'Completa este campo.' : 'Introduce un valor válido dentro del rango permitido.';
          input.setAttribute('aria-describedby', error.id); input.after(error);
          const link = document.createElement('a'); link.href = `#${input.id}`; link.textContent = input.labels[0]?.textContent || input.name;
          link.addEventListener('click', () => input.focus());
          const item = document.createElement('div'); item.append(link); title.append(item);
        });
        errorBox.append(title); errorBox.hidden = false; errorBox.focus(); return;
      }
      errorBox.hidden = true;
      const data = new FormData(propertyForm);
      const newProperty = Object.fromEntries(data);
      for (const name of ['price', 'area', 'rooms', 'baths']) newProperty[name] = Number(data.get(name));
      newProperty.city = String(data.get('city')).trim();
      if (!newProperty.city) { $('#city').value = ''; propertyForm.requestSubmit(); return; }
      newProperty.extras = data.getAll('extras');
      const text = describe(newProperty, preferences.tone, preferences.length);
      if ($('#demo-preview') && editor.value !== baseText && !window.confirm('El nuevo ejemplo reemplazará tus cambios. ¿Quieres continuar?')) return;
      if (!write(keys.property, newProperty)) return;
      if (!write(keys.text, text)) return;
      if ($('#demo-preview')) {
        $('#demo-preview-empty').hidden = true; $('#demo-preview').hidden = false;
        setEditor(text); summarize(newProperty); editor.focus(); announce('Ejemplo preparado. Puedes editarlo; no se ha utilizado IA.');
      } else window.location.href = 'anuncio.html';
    });
  }
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  let pendingGeneration;
  function regenerate(length, tone) {
    const apply = () => { setEditor(describe(getProperty(), tone, length)); write(keys.text, editor.value); announce('Ejemplo actualizado con los datos de tu ficha.'); };
    if (editor.value !== baseText) { pendingGeneration = apply; $('#replace-dialog').showModal(); } else apply();
  }
  $('#regenerate')?.addEventListener('click', () => regenerate(choiceValue('length'), choiceValue('tone')));
  $('#shorten')?.addEventListener('click', () => { setChoice('length', 'breve'); regenerate('breve', choiceValue('tone')); });
  $('#change-tone')?.addEventListener('click', () => { setChoice('tone', choiceValue('tone') === 'cercano' ? 'profesional' : 'cercano'); regenerate(choiceValue('length'), choiceValue('tone')); });
  $('#confirm-replace')?.addEventListener('click', () => { $('#replace-dialog').close(); pendingGeneration?.(); pendingGeneration = null; });
  $('#copy-ad')?.addEventListener('click', async () => {
    if (!editor.value.trim()) return announce('Escribe o prepara una descripción antes de copiar.');
    try { await navigator.clipboard.writeText(editor.value); announce('Descripción copiada. Ya puedes pegarla en tu anuncio.'); }
    catch { editor.focus(); editor.select(); announce('El navegador no permite copiar automáticamente. Texto seleccionado: usa Ctrl+C o el comando Copiar.'); }
  });
  $('#save-draft')?.addEventListener('click', () => {
    if (!editor.value.trim()) return announce('Escribe o prepara una descripción antes de guardar.');
    const property = getProperty();
    const draft = { id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`, name: `${capital(String(property.type))} en ${property.city}`, property, text: editor.value, date: new Date().toISOString(), demo: false };
    if (write(keys.drafts, [draft, ...getDrafts()])) { write(keys.text, editor.value); baseText = editor.value; announce('Borrador guardado. Lo encontrarás en Borradores.'); }
  });
  let activeDraftId;
  function renderDrafts() {
    const list = $('#draft-list'); if (!list) return;
    const all = getDrafts();
    const query = ($('#draft-search')?.value || '').trim().toLocaleLowerCase('es');
    const visible = all.filter(d => `${d.name} ${d.property.city}`.toLocaleLowerCase('es').includes(query));
    list.replaceChildren();
    $('#draft-count').textContent = `${all.length} ${all.length === 1 ? 'borrador guardado' : 'borradores guardados'}`;
    $('#empty-drafts').hidden = all.length !== 0;
    $('#no-draft-results').hidden = all.length === 0 || visible.length !== 0;
    for (const draft of visible) {
      const card = document.createElement('article'); card.className = 'draft-card';
      const top = document.createElement('div'); top.className = 'draft-card-top';
      const badge = document.createElement('span'); badge.className = 'badge subtle'; badge.textContent = draft.demo ? 'Ejemplo ficticio' : 'Borrador local';
      const time = document.createElement('time'); time.dateTime = draft.date;
      const date = new Date(draft.date); time.textContent = Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-ES', { day:'numeric', month:'short' });
      top.append(badge, time);
      const title = document.createElement('h3'); title.textContent = draft.name;
      const meta = document.createElement('p'); meta.textContent = `${draft.property.area} m² · ${draft.property.rooms} hab. · ${draft.property.city}`;
      const actions = document.createElement('div'); actions.className = 'draft-card-actions';
      const makeButton = (text, cls, handler) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.className = cls; b.setAttribute('aria-label', `${text}: ${draft.name}`); b.addEventListener('click', handler); actions.append(b); };
      makeButton('Abrir', 'button secondary open-draft', () => { if (write(keys.property, draft.property) && write(keys.text, draft.text)) window.location.href = 'anuncio.html'; });
      makeButton('Renombrar', 'text-button', () => { activeDraftId = draft.id; $('#draft-name').value = draft.name; $('#draft-dialog').showModal(); $('#draft-name').focus(); });
      makeButton('Eliminar', 'text-button', () => { activeDraftId = draft.id; $('#delete-description').textContent = `Se eliminará «${draft.name}». Esta acción no se puede deshacer.`; $('#delete-dialog').showModal(); });
      card.append(top, title, meta, actions); list.append(card);
    }
  }
  $('#draft-search')?.addEventListener('input', renderDrafts);
  $('#load-examples')?.addEventListener('click', () => {
    const drafts = getDrafts();
    const examples = [
      { id:'sample-sevilla', name:'Una terraza en Sevilla', property:{ ...defaults } },
      { id:'sample-jerez', name:'Un nuevo comienzo en Jerez', property:{ ...defaults, city:'Jerez de la Frontera', area:78, rooms:2, baths:1, price:850, operation:'alquiler', extras:['Ascensor'] } }
    ].filter(sample => !drafts.some(d => d.id === sample.id)).map(sample => ({ ...sample, text:describe(sample.property), date:new Date().toISOString(), demo:true }));
    if (!examples.length) return announce('Los ejemplos ya están en tu biblioteca.');
    if (write(keys.drafts, [...drafts, ...examples])) { renderDrafts(); announce('Dos ejemplos ficticios disponibles para explorar.'); }
  });
  $('#draft-rename-form')?.addEventListener('submit', event => {
    event.preventDefault(); const input = $('#draft-name'); const name = input.value.trim();
    if (!name) { input.setCustomValidity('Introduce un nombre para el borrador.'); input.reportValidity(); return; }
    if (write(keys.drafts, getDrafts().map(d => d.id === activeDraftId ? { ...d, name } : d))) { $('#draft-dialog').close(); renderDrafts(); $('#draft-search').focus(); announce('Nombre del borrador actualizado.'); }
  });
  $('#draft-name')?.addEventListener('input', () => $('#draft-name').setCustomValidity(''));
  $('#confirm-delete')?.addEventListener('click', () => {
    if (write(keys.drafts, getDrafts().filter(d => d.id !== activeDraftId))) { $('#delete-dialog').close(); renderDrafts(); $('#draft-search').focus(); announce('Borrador eliminado.'); }
  });
  renderDrafts();
  if ($('#settings-form')) {
    setChoice('default-tone', preferences.tone || 'profesional'); setChoice('default-length', preferences.length || 'estandar'); $('#reduce-motion').checked = preferences.reduceMotion === true;
    $('#settings-form').addEventListener('submit', event => {
      event.preventDefault(); const values = { tone:choiceValue('default-tone'), length:choiceValue('default-length'), reduceMotion:$('#reduce-motion').checked };
      if (write(keys.preferences, values)) { document.documentElement.dataset.reduceMotion = String(values.reduceMotion); announce('Preferencias guardadas para los próximos anuncios.'); }
    });
  }
  $('#clear-data')?.addEventListener('click', () => $('#clear-dialog').showModal());
  $('#confirm-clear')?.addEventListener('click', () => {
    try { Object.values(keys).forEach(key => localStorage.removeItem(key)); $('#clear-dialog').close(); $('#settings-form').reset(); document.documentElement.dataset.reduceMotion = 'false'; announce('Datos locales de FINCA eliminados.'); }
    catch { announce('No se pudieron eliminar los datos. Revisa los permisos de almacenamiento del navegador.'); }
  });
})();
