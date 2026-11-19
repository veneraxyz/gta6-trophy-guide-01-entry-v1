// Leonida Legend — the tracker: renders the 55 trophies from data/trophies.json,
// filters them by kind, hides story spoilers on request, and saves the checklist
// in localStorage with export/import. Loads nothing from the network.
import { renderRoadmap } from './roadmap.js';

const STORE_KEY = 'leonida-legend-progress-v1';
const SPOILER_KEY = 'leonida-legend-spoiler-v1';
const listEl = document.getElementById('trophy-list');
const detailEl = document.getElementById('detail');
const filterNote = document.getElementById('filter-note');
const onlineNote = document.getElementById('online-note');
const searchInput = document.getElementById('search');
const spoilerBox = document.getElementById('spoiler');

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = new Set(JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]'));
let filter = 'all';
let query = '';
let selectedId = null;

function isSpoilerHidden(t) {
  return spoilerBox.checked && t.kind === 'story' && !earned.has(t.id);
}

function persist() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned]));
}

function visibleTrophies() {
  return trophies.filter((t) => {
    if (filter === 'missable' && !t.missable) return false;
    if (filter === 'online') return false;
    if (filter !== 'all' && filter !== 'missable' && t.kind !== filter) return false;
    if (query) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}

function gradeBadge(t) {
  const span = document.createElement('span');
  span.className = `grade-badge ${t.grade}`;
  span.textContent = t.grade;
  return span;
}

function tagEl(text, cls) {
  const span = document.createElement('span');
  span.className = `tag${cls ? ` ${cls}` : ''}`;
  span.textContent = text;
  return span;
}

function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren();
  onlineNote.hidden = filter !== 'online';
  if (filter === 'online') {
    filterNote.textContent = 'No online trophies in this list — every trophy unlocks in single-player.';
  } else if (filter === 'missable') {
    filterNote.textContent = '2 trophies need care: one missable meditation and one time-sensitive race. Read their guides before the chapters pass.';
  } else if (query) {
    filterNote.textContent = `${shown.length} of 55 trophies match “${query}”.`;
  } else {
    filterNote.textContent = '';
  }
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = `trophy${earned.has(t.id) ? ' earned' : ''}${t.id === selectedId ? ' selected' : ''}`;
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('change', (event) => {
      event.stopPropagation();
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      persist();
      renderProgress();
      renderList();
      renderDetail();
    });
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'trophy-name';
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    if (isSpoilerHidden(t)) {
      name.innerHTML = '<span class="spoiler-mask">Hidden story trophy</span>';
      desc.innerHTML = '<span class="spoiler-mask">Name and description hidden until earned — spoiler setting on.</span>';
    } else {
      name.textContent = t.name;
      desc.textContent = t.description;
    }
    body.append(name, desc);
    const tags = document.createElement('div');
    tags.className = 'trophy-tags';
    if (t.missable) tags.append(tagEl('Missable', 'missable'));
    if (t.hidden) tags.append(tagEl('Hidden', 'hidden-t'));
    if (t.target) tags.append(tagEl(`Target: ${t.target.toLocaleString('en-US')}`));
    tags.append(tagEl(t.kind));
    body.append(tags);
    li.append(box, body, gradeBadge(t));
    li.addEventListener('click', () => {
      selectedId = t.id;
      renderList();
      renderDetail();
    });
    listEl.append(li);
  }
}

function renderDetail() {
  const t = byId.get(selectedId);
  if (!t) {
    detailEl.innerHTML = '<p class="detail-empty">Pick a trophy to read its guide, steps and sources.</p>';
    return;
  }
  detailEl.replaceChildren();
  const hidden = isSpoilerHidden(t);
  const h2 = document.createElement('h2');
  h2.textContent = hidden ? 'Hidden story trophy' : t.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = hidden ? 'Its name and description stay hidden until you earn it.' : `“${t.description}”`;
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.append(gradeBadge(t));
  if (t.missable) meta.append(tagEl('Missable', 'missable'));
  if (t.hidden) meta.append(tagEl('Hidden on PlayStation', 'hidden-t'));
  meta.append(tagEl(t.kind));
  if (t.target) meta.append(tagEl(`Target: ${t.target.toLocaleString('en-US')}`));
  detailEl.append(h2, official, meta);
  if (t.missable && t.missableNote) {
    const warn = document.createElement('div');
    warn.className = 'missable-box';
    warn.textContent = `Missable — ${t.missableNote}`;
    detailEl.append(warn);
  }
  const guideHeading = document.createElement('h3');
  guideHeading.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = t.guide;
  detailEl.append(guideHeading, guide);
  // The citation sits right under the guide, so a reader sees where the facts
  // come from before the steps — and it stays visible in a single screen.
  const cite = document.createElement('p');
  cite.className = 'citation';
  cite.textContent = 'Source: ';
  const link = document.createElement('a');
  link.href = t.citation.url;
  link.textContent = t.citation.name;
  link.rel = 'noopener';
  cite.append(link);
  detailEl.append(cite);
  if (t.steps && t.steps.length > 0) {
    const stepsHeading = document.createElement('h3');
    stepsHeading.textContent = 'Steps';
    const ol = document.createElement('ol');
    for (const step of t.steps) {
      const li = document.createElement('li');
      li.textContent = step;
      ol.append(li);
    }
    detailEl.append(stepsHeading, ol);
  }
}

function renderProgress() {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) {
    totals[t.grade]++;
    if (earned.has(t.id)) counts[t.grade]++;
  }
  document.getElementById('earned-count').textContent = earned.size;
  const pct = Math.round((earned.size / trophies.length) * 100);
  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  document.getElementById('grade-counts').innerHTML =
    `<span>Platinum <b>${counts.platinum}/${totals.platinum}</b></span>` +
    `<span>Gold <b>${counts.gold}/${totals.gold}</b></span>` +
    `<span>Silver <b>${counts.silver}/${totals.silver}</b></span>` +
    `<span>Bronze <b>${counts.bronze}/${totals.bronze}</b></span>`;
}

function renderSources() {
  const ul = document.getElementById('source-list');
  for (const s of data.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.name;
    a.rel = 'noopener';
    li.append(a);
    ul.append(li);
  }
}

function exportProgress() {
  const payload = { app: 'leonida-legend', version: 1, earned: [...earned].sort((a, b) => a - b) };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  try {
    const payload = JSON.parse(await file.text());
    const ids = Array.isArray(payload) ? payload : payload.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    earned = new Set(ids.filter((id) => byId.has(id)));
    persist();
    renderProgress();
    renderList();
    renderDetail();
  } catch {
    filterNote.textContent = 'That file is not a Leonida Legend progress export — nothing was imported.';
  }
}

document.querySelectorAll('.filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    filter = btn.dataset.filter;
    renderList();
  });
});
searchInput.addEventListener('input', () => {
  query = searchInput.value.trim().toLowerCase();
  renderList();
});
spoilerBox.addEventListener('change', () => {
  localStorage.setItem(SPOILER_KEY, spoilerBox.checked ? '1' : '0');
  renderList();
  renderDetail();
});
document.getElementById('export-btn').addEventListener('click', exportProgress);
document.getElementById('import-file').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) importProgress(file);
  event.target.value = '';
});

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    document.getElementById(`view-${tab.dataset.view}`).classList.add('active');
  });
});

// Deep links for sharing a trophy: ?open=<id>, ?filter=<kind>, ?spoiler=1, ?view=roadmap
const params = new URLSearchParams(location.search);
if (params.get('view') === 'roadmap' || params.get('view') === 'about') {
  document.querySelector(`.tab[data-view="${params.get('view')}"]`).click();
}
if (params.get('filter')) {
  const btn = document.querySelector(`.filter[data-filter="${params.get('filter')}"]`);
  if (btn) btn.click();
}
if (params.get('spoiler') === '1') {
  spoilerBox.checked = true;
} else if (localStorage.getItem(SPOILER_KEY) === '1') {
  spoilerBox.checked = true;
}
if (params.get('open')) {
  const id = Number(params.get('open'));
  if (byId.has(id)) selectedId = id;
}

renderSources();
renderRoadmap(byId, earned);
renderProgress();
renderList();
renderDetail();
