// Leonida Legend — the roadmap: renders the seven stages from
// data/roadmap.json, naming each stage's trophies with their grades.
export async function renderRoadmap(byId, earned) {
  const stagesEl = document.getElementById('roadmap-stages');
  const data = await (await fetch('data/roadmap.json')).json();
  for (const stage of data.stages) {
    const li = document.createElement('li');
    li.className = 'stage';
    const h3 = document.createElement('h3');
    h3.textContent = stage.title;
    const note = document.createElement('p');
    note.className = 'stage-note';
    note.textContent = stage.note;
    const ul = document.createElement('ul');
    for (const id of stage.trophies) {
      const t = byId.get(id);
      if (!t) continue;
      const item = document.createElement('li');
      const mark = earned.has(id) ? '✓ ' : '';
      item.textContent = `${mark}${t.name} — ${t.grade}${t.missable ? ' · MISSABLE' : ''}`;
      ul.append(item);
    }
    const count = document.createElement('p');
    count.className = 'stage-trophies';
    const done = stage.trophies.filter((id) => earned.has(id)).length;
    count.innerHTML = `<b>${done}/${stage.trophies.length}</b> trophies in this stage earned`;
    li.append(h3, note, ul, count);
    stagesEl.append(li);
  }
}
